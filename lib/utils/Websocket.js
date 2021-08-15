"use strict";

const Constants = require("../Constants");
const { DiscordError } = require("../errors/DiscordErrors");
const EventEmitter = require('../client/Events');
const { GATEWAY_VERSION } = require("../Constants");
const { sum } = require('./Util');
const ws = require('ws');

class Websocket {
    constructor(client, shardID) {
        if (!client.http) 
            throw new DiscordError("No HTTP connection found");

        this.client = client;
        this.shardID = shardID;
        this.latencies = [];
        this.lastPing = null;
        this.sequence = null;
        this.sessionID = null;
        this._started = false;
        this.ws = undefined;
    }

    get id() {
        if (!this.client.isSharded)
            throw new TypeError("Client must be sharded to use this getter");
        return this.shardID;
    }

    get socketURL() {
        return `wss://gateway.discord.gg/?v=${Constants.GATEWAY_VERSION}&encoding=json`
    }

    async send(...args) {
        await this.client.emit("websocketRawSend", ...args);
        await this.ws.send(...args);
    }

    async start() {
        if (this._started) 
            throw new DiscordError("Gateway has already connected");

        this.ws = new ws(this.socketURL);
        await this.setupWebsocket();
    }

    async setupWebsocket() {
        this.ws.on('message', async (data) => {
            if (typeof data !== "object") 
                data = JSON.parse(data);

            await this.client.emit("websocketRawReceive", data);
            await this.processWebsocketData(data);
        });
    }

    async doHeartbeat() {
        this.lastPing = parseFloat(process.hrtime().join("."));
        await this.send(JSON.stringify({
            op: 1,
            d: this.sequence
        }));
    }

    async processWebsocketData(rawData) {
        if (!rawData) return;
        const data = rawData.d;
        const op = parseInt(rawData.op);
        
        if (op === 0) {
            this.sequence = rawData.s || this.sequence;
            await this.client.emit("gatewayEventReceive", rawData.t, data);
            await EventEmitter(this.client, this, rawData.t, data)
        } else if (op == 1) {
            this.lastPing = parseFloat(process.hrtime().join("."));
            this.send(JSON.stringify({
                op: 1, sequence: rawData
            }));
        } else if (op == 10) {
            await this.doHeartbeat();
            let payload = {
                op: 2,
                d: {
                    v: GATEWAY_VERSION,
                    token: this.client.token,
                    intents: this.client.options.intents,
                    properties: {
                        "$os": process.platform,
                        '$browser': "Yuko",
                        '$device': "Yuko"
                    }
                }
            }
            if (this.client.isSharded)
                payload.shard = [
                    this.shardID,
                    this.client._shardCount
                ];

            await this.send(JSON.stringify(payload));

            setInterval(async() => await this.doHeartbeat(), data.heartbeat_interval);
        } else if (op == 11) {
            if (this.lastPing) {
                let current = parseFloat(process.hrtime().join("."));
                this.latencies.push(current - this.lastPing);
            }
        }
    }

    get latency() {
        let latencies = this.latencies;
        let lastThree = latencies.slice(-3);
        return (sum(lastThree) / lastThree.length) * 1000
    }
}

module.exports = Websocket;