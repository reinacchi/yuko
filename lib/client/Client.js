"use strict";

const { sum } = require("../utils/Util");
const Intents = require("../structures/Intents");
const { InvalidToken } = require("../errors/DiscordErrors");
const HTTPManager = require("../rest/HTTPManager");
const RESTManager = require("../rest/RESTManager");
const Websocket = require("../utils/Websocket");
const EventEmitter = require("./EventEmitter");

class Client extends EventEmitter {
    constructor(token, { 
        allowedMentions,
        intents = Intents.default(), 
        shard = false,
        shardCount = null
    } = {}) {
        super();

        this.isSharded = shard;
        this.allowedMentions = allowedMentions;
        this.intents = intents;
        this.connected = false;
        this.http = null;
        this.rest = new RESTManager(this);
        this.token = token;
        this.user = null;
        this.ws = null;
        this._shardCount = shardCount;
        this._shards = [];
    }

    get shards() {
        if (!this.isSharded) 
            throw new TypeError("Client must be isSharded to use this getter");
        return this._shards;
    }

    get latency() {
        if (!this.isSharded)
            return this.ws.latency;
        return sum(this.shards, s => s.latency) / this.shards.length;
    }

    get latencies() {
        if (!this.isSharded)
            return [this.latency];
        return this.shards.map(s => s.latency);
    }

    _putToken(token) {
        if (!token) throw new InvalidToken("No token provided");
        this.token = token;
    }

    _establishHTTP() {
        this.http = new HTTPManager(this);
    }

    async _establishWebsocket() {
        if (!this.isSharded) {
            this.ws = new Websocket(this);
        }
        
        return await (async () => {
            if (!this._shardCount) {
                return await this.http.getRecommendedShardCount();
            }
            return this._shardCount
        })().then(count => {
            this._shardCount = count;
            for (let i = 0; i < count; i++) {
                const shard = new Websocket(this, i);
                this._shards.push(shard);
            }
            this.ws = this._shards[0];
        });
    }

    _startWebsockets() {
        if (!this.isSharded) {
            return this.ws.start();
        }
        this._shards.forEach(s => s.start());
    }

    async start(token) {
        this._putToken(token);
        this._establishHTTP();
        await this._establishWebsocket();
        this._startWebsockets();
    }

    connect() {
        this.start(this.token);
    }
}

module.exports = Client;