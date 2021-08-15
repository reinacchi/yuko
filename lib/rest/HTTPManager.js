"use strict";

const Endpoints = require("./Endpoints");
const { InvalidToken } = require("../errors/DiscordErrors");
const RESTManager = require("./RESTManager");

class Route {
    constructor(method='GET', route='/') {
        if (route.startsWith('/')) route = route.slice(1);
        this.baseURL = `${Endpoints.DISCORD_URL}${Endpoints.API_URL}`; 
        this.method = method;
        this.route = route;
    }

    get url() {
        return this.baseURL + '/' + this.route; 
    }
}


class HTTPManager {
    constructor(client) {
        this.client = client;
        this.requesters = new Map();
        this.ratelimit = {
            limit: Infinity,
            remaining: Infinity,
            reset: null,
            delay: null, 
        }
    } 

    get userAgent() {
        return `DiscordBot (https://github.com/NotMarx/yuko, ${require("../../package.json").version})`;
    }

    get token() {
        if (!this.client.token)
            throw new InvalidToken("No token provided");
        return this.client.token
    }

    route(...args) {
        return new Route(...args);
    }

    async request(route, payload, contentType="application/json") {
        let requester = this.requesters.get(route.url);
        if (!requester) {
            requester = new RESTManager(this);
            this.requesters.set(route.url, requester);
        }

        const res = await requester.request(route, payload, contentType);
        try {
            return await res.json();
        } catch (exc) {
            return null;
        }
    }
    
    async getConnectionInfo() {
        const route = this.route("GET", Endpoints.GATEWAY_BOT);
        return await this.request(route);
    }

    async getRecommendedShardCount() {
        return (await this.getConnectionInfo()).shards;
    }

    async getClientInformation() {
        return await this.request(this.route("GET", Endpoints.USER("@me")));
    }
}

module.exports = HTTPManager;