"use strict";

const ClientUser = require("../structures/ClientUser");
const Constants = require("../Constants");
const { DiscordError } = require("../errors/DiscordErrors");
const Guild = require("../structures/Guild");
const Message = require("../structures/Message");
const { sum } = require("../utils/Util");
const Websocket = require("ws");

/**
 * Represents a shard
 * @property {Number} id The ID of the shard
 * @property {Number} lastPing The last ping
 * @property {Array<Number>} latencies An array of latency belongs to all shards
 * @property {Number} latency The latency of the gateway
 * @property {Object} sequence The sequence number
 * @property {String} sessionID The ID of the session used for connections
 * @property {String} socketURL The URl of the socket
 */
class Shard {
    constructor(client, shardID) {
        if (!client.http) {
            throw new DiscordError("No HTTP connection found");
        }

        this.client = client;
        this.connected = false;
        this.id = shardID;
        this.latencies = [];
        this.lastPing = null;
        this.sequence = null;
        this.sessionID = null;
        this.ws = undefined;

        this._wsClose = this._wsClose.bind(this);

        this.resetAll();
    }

    get latency() {
        const latencies = this.latencies;
        const lastThree = latencies.slice(-3);
        return (sum(lastThree) / lastThree.length) * 1000;
    }

    get socketURL() {
        return `wss://gateway.discord.gg/?v=${Constants.GATEWAY_VERSION}&encoding=json`;
    }

    async heartbeat() {
        this.lastPing = parseFloat(process.hrtime().join("."));
        await this.send(JSON.stringify({
            op: Constants.GatewayOPCodes.HEARTBEAT,
            d: this.sequence
        }));
    }

    async identify() {
        const payload = {
            op: Constants.GatewayOPCodes.IDENTIFY,
            d: {
                v: Constants.GATEWAY_VERSION,
                token: this.client.token,
                intents: this.client.options.intents,
                properties: {
                    "$os": process.platform,
                    "$browser": "Yuko",
                    "$device": "Yuko"
                }
            }
        };

        if (this.client.options.shardCount > 1) {
            payload.shard = [this.id, this.client.options.shardCount];
        }

        await this.send(JSON.stringify(payload));
    }

    async processWebsocketData(rawData) {
        if (!rawData) {
            return;
        }

        const data = rawData.d;
        const op = parseInt(rawData.op);

        switch (op) {
            case Constants.GatewayOPCodes.EVENT: {
                this.sequence = rawData.s || this.sequence;
                await this.websocketEvent(rawData);
                await this.client.emit("rawWebsocket", rawData);
                break;
            }

            case Constants.GatewayOPCodes.RECONNECT: {
                this.restart();
                break;
            }

            case Constants.GatewayOPCodes.HEARTBEAT: {
                this.heartbeat();
                break;
            }

            case Constants.GatewayOPCodes.HELLO: {
                if (this.sessionID) {
                    this.resume();
                } else {
                    await this.heartbeat();
                    await this.identify();
                }

                setInterval(async() => await this.heartbeat(), data.heartbeat_interval);
                break;
            }

            case Constants.GatewayOPCodes.HEARTBEAT_ACK: {
                if (this.lastPing) {
                    const current = parseFloat(process.hrtime().join("."));
                    this.latencies.push(current - this.lastPing);
                }

                break;
            }

            case Constants.GatewayOPCodes.INVALID_SESSION: {
                this.sequence = 0;
                this.sessionID = null;
                this.identify();
                break;
            }
        }
    }

    reset() {
        this.connected = false;
    }

    resetAll() {
        this.reset();
        this.sequence = 0;
        this.sessionID = null;
        this.latencies = [];
        this.ws = null;
    }

    restart() {
        if (!this.ws) {
            return;
        }

        if (this.ws.readyState !== Constants.WebsocketState.CLOSE) {
            this.ws.removeListener("close", this._wsClose);

            try {
                if (this.sessionID) {
                    if (this.ws.readyState === Constants.WebsocketState.OPEN) {
                        this.ws.close(4091, "Yuko Reconnect");
                    } else {
                        this.ws.close();
                    }
                } else {
                    this.ws.close(1000, "Yuko Stable");
                }
            } catch (err) {
                this.client.emit("error", err, this.id);
            }
        }

        this.ws = null;
        this.reset();

        if (this.client.options.autoReconnect) {
            if (this.sessionID) {
                this.start();
            } else {
                setTimeout(() => {
                    this.start();
                }, 15000);
            }
        } else {
            this.resetAll();
        }
    }

    async resume() {
        const payload = {
            op: Constants.GatewayOPCodes.RESUME,
            d: {
                token: this.client.token,
                session_id: this.sessionID,
                seq: this.sequence
            }
        };

        await this.send(JSON.stringify(payload));
    }

    async send(data) {
        await this.ws.send(data);
    }

    setupWebsocket() {
        this.ws.on("message", async(data) => {
            if (typeof data !== "object") {
                data = JSON.parse(data);
            }

            await this.processWebsocketData(data);
        });
        this.ws.on("error", (error) => {
            this.client.emit("error", error, this.id);
        });
        this.ws.on("close", this._wsClose);
    }

    async start() {
        if (this.connected) {
            throw new DiscordError("Gateway has already connected");
        }

        this.ws = new Websocket(this.socketURL);
        await this.setupWebsocket();
    }

    async websocketEvent(packet) {
        switch (packet.t) {
            case "READY": {
                this.sessionID = packet.d.session_id;

                await this.client.emit("shardPreReady", this.id);

                if (!this.id) {
                    this.connected = true;
                    this.client.connected = true;
                    this.client.user = new ClientUser(this.client, packet.d.user);
                    this.client.startupTimestamp = Date.now();
                    await this.client.emit("gatewayReady");
                }

                break;
            }

            case "RESUMED": {
                await this.client.emit("gatewayResumed");
                break;
            }

            case "MESSAGE_CREATE": {
                const message = new Message(this.client, packet.d);
                this.client.messages.add(message);
                await this.client.emit("messageCreate", message);
                break;
            }

            case "GUILD_CREATE": {
                const unavailable = packet.d.unavailable;

                if (unavailable) {
                    return;
                }

                if (unavailable === false) {
                    const guild = new Guild(this.client, packet.d);
                    this.client.guilds.add(guild);

                    if (this.connected) {
                        this.client.emit("guildAvailable", guild);
                    } else {
                        this.client.emit("guildCreate", guild);
                    }
                }
            }
        }
    }

    _wsClose(code, reason) {
        reason = reason.toString();
        let err = !code || code === 1000 ? null : new DiscordError(`${code}: ${reason}`);

        if (code) {
            if (code === 1006) {
                err = new DiscordError("Connection reset by peer");
            }

            if (err) {
                err.code = code;
            }
        }

        this.restart();
    }
}

module.exports = Shard;