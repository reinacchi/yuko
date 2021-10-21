"use strict";

const Client = require("../Client");
const { DiscordHTTPError, DiscordAPIError, InvalidToken } = require("../errors/DiscordErrors");
const Endpoints = require("./Endpoints");
const Queue = require("../utils/Queue");
const utils = require("../utils/Util");
const fetch = require("node-fetch");

let badRequests = 0;
let resetCounterAt = null;
const REQUEST_OFFSET = 500;
const RETRY_LIMIT = 1;

class Route {
    constructor(method, route) {
        if (route.startsWith("/")) route = route.slice(1);
        this.baseURL = `${Endpoints.DISCORD_URL}${Endpoints.API_URL}`; 
        this.method = method;
        this.route = route;
    }

    get url() {
        return this.baseURL + "/" + this.route; 
    }
}

/**
 * A REST Manager which handles API requests and rate limits
 */
class RESTManager {
    /**
     * Handles API requests and rate limits
     * @param {Client} client Yuko client
     */
    constructor(client) {
        this.client = client;
        this.ratelimit = {
            limit: Infinity,
            remaining: Infinity,
            reset: null,
            delay: null, 
        };
        this._queue = new Queue();
        this._reset = -1;
        this._remaining = -1;
        this._limit = -1;
        this.retries = new Map();
        this.requesters = new Map();
    }

    get userAgent() {
        return `DiscordBot (https://github.com/NotMarx/yuko, ${require("../../package.json").version})`;
    }

    get token() {
        if (!this.client.token)
            throw new InvalidToken("No token provided");
        return this.client.token
    }

    /**
     * Create a route
     * @param {String} method The HTTP method
     * @param {String} route The endpoint
     * @returns {Route}
     */
    route(method, route) {
        return new Route(method, route);
    }

    /**
     * Create an API request
     * @param {String} method The HTTP method
     * @param {String} endpoint The endpoint URL
     * @param {Object} payload Request the payload
     * @param {String} [contentType="application/json"] The HTTP content type
     * @returns {Promise<any>}
     */
    async request(method, endpoint, payload, contentType="application/json") {
        const route = this.route(method, endpoint);
        let requester = this.requesters.get(route.url);
        if (!requester) {
            requester = this;
            this.requesters.set(route.url, requester);
        }

        const res = await requester._request(route, payload, contentType);
        try {
            return await res.json();
        } catch (exc) {
            return null;
        }
    }

    async _request(route, payload, contentType="application/json") {
        await this._queue.wait();
        try {
            return await this.__request(route, payload, contentType);
        } finally {
            this._queue.shift();
        }
    }

    get globallyLimited() {
        return this.ratelimit.remaining <= 0 
            && Date.now() < this.ratelimit.reset;
    }

    get locallyLimited() {
        return this._remaining <= 0 
            && Date.now() < this._reset;
    }

    get ratelimited() {
        return this.globallyLimited || this.locallyLimited;
    }

    get running() {
        return this._queue.count > 0 || this.ratelimited;
    }
 
    _delay(delay) {
        return new Promise(r => {
            setTimeout(() => {
                this.ratelimit.delay = null;
                r();
            }, delay);
        })
    }

    _incrRetries(key) {
        let buffer = this.retries.get(key);
        this.retries.set(key, buffer + 1);
    }

    async __request(route, payload, contentType) {
        const headers = {
            "Content-Type": contentType,
            "User-Agent": this.userAgent,
            "Authorization": `Bot ${this.token}`
        };

        const method = route.method.toUpperCase();

        let body;
        if (payload) {
            payload["Content-Type"] = contentType
            body = JSON.stringify(payload);
        }

        if (!this.retries.has([route, payload]))
            this.retries.set([route, payload], 0);
        const options = { method: method, headers: headers, body: body };

        while (this.ratelimited) {
            const isGlobalLimit = this.globallyLimited;
            let limit, timeout, delay;

            if (isGlobalLimit) {
                limit = this.ratelimit.limit;
                timeout = this.ratelimit.reset + REQUEST_OFFSET - Date.now();

                if (!this.ratelimit.delay)
                    this.ratelimit.delay = this._delay(timeout);
                delay = this.ratelimit.delay;
            } else {
                limit = this._limit;
                timeout = this._reset + REQUEST_OFFSET - Date.now();
                delay = utils.sleep(timeout);
            }

            await delay;
        }

        if (!this.ratelimit.reset || this.ratelimit.reset < Date.now()) {
            this.ratelimit.reset = Date.now() + 1000;
            this.ratelimit.remaining = this.ratelimit.limit;
            
        }
        this.ratelimit.remaining--;

        let response;
        try {
            response = await fetch(route.url, options);
        } catch (exc) {
            if (this.retries.get([route, payload]) >= RETRY_LIMIT) {
                throw new DiscordHTTPError(`${error.status}: ${exc.message}`);
            }

            this._incrRetries([route, payload]);
            return this.__request(route, payload, contentType);
        }

        let _timeout;
        if (response?.headers) {
            const h = response.headers;
            const date = h.get('date');
            const limit = h.get('x-ratelimit-limit');
            const remaining = h.get('x-ratelimit-remaining');
            const reset = h.get('x-ratelimit-reset');
            const resetAfter = h.get('x-ratelimit-reset-after');

            this._limit = limit ? Number(limit) : Infinity;
            this._remaining = remaining ? Number(remaining) : 1;
            this._reset = reset || resetAfter
                ? (
                    resetAfter 
                    ? Date.now() + Number(resetAfter) * 1000
                    : new Date(Number(reset) * 1000).getTime()
                        - (new Date(date).getTime() - Date.now())
                ) : Date.now();
            
            if (!resetAfter && route.url.includes('reactions'))
                this._reset = new Date(date).getTime() - (
                    new Date(date).getTime() - Date.now()
                );
            
            let retryAfter = h.get('retry-after');
            retryAfter = retryAfter ? Number(retryAfter) * 1000 : -1;
            if (retryAfter > 0) {
                if (h.get('x-ratelimit-global')) {
                    this.ratelimit.remaining = 0;
                    this.ratelimit.reset = Date.now() + retryAfter;
                } else if (!this.locallyLimited) {
                    _timeout = retryAfter;
                }
            }
        }

        if ([401, 403, 429].includes(response.status)) {
            if (!resetCounterAt || resetCounterAt < Date.now()) {
                resetCounterAt = Date.now() + 1000 * 600;
                badRequests = 0;
            }
            badRequests++;
        }

        if (response.ok) 
            return response;

        if (400 <= response.status < 500) {
            if (response.status === 429) {
                if (_timeout) {
                    await utils.sleep(_timeout);
                }
                return this.__request(route, payload, contentType);
            }
            let jsoned = await response.json();
            throw new DiscordAPIError(response, jsoned);
        }

        if (500 <= response.status < 600) {
            if (this.retries.get([route, payload]) >= RETRY_LIMIT) {
                throw new DiscordHTTPError(response.statusText);
            }
            this._incrRetries([route, payload]);
            return this.__request(route, payload, contentType);
        }

        return null;
    }
}

module.exports = RESTManager;