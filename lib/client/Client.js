"use strict";

const Collection = require("../utils/Collection");
const Constants = require("../Constants");
const { sum } = require("../utils/Util");
const { DiscordError, InvalidToken } = require("../errors/DiscordErrors");
const Endpoints = require("../rest/Endpoints");
const { EventEmitter } = require("events");
const Message = require("../structures/Message");
const HTTPManager = require("../rest/HTTPManager");
const RESTManager = require("../rest/RESTManager");
const Websocket = require("../utils/Websocket");

/**
 * Represents Yuko main client
 */
class Client extends EventEmitter {
    /**
     * Create a client
     * @param {String} token The bot's token
     * @param {Object} [options] Yuko client options
     * @param {Array<String>} options.intents The intents applied
     * @param {Boolean} [options.shard=false] Whether to enable sharding or not
     * @param {Number | String} [options.shardCount=null] The bot's total shard size 
     */
    constructor(token, options) {
        super();

        this.options = Object.assign({
            shard: false,
            shardCount: null
        }, options);

        if (this.options.hasOwnProperty("intents")) {
            if (Array.isArray(this.options.intents)) {
                let bit = 0;
                for (const intent of this.options.intents) {
                    if (Constants.Intents[intent]) {
                        bit |= Constants.Intents[intent];
                    }
                }
                this.options.intents = bit;
            }
        }

        if (!this.options.intents || this.options.intents.length === 0) {
            throw new DiscordError("Missing Intents!");
        }

        this.messages = new Collection();
        this.isSharded = this.options.shard;
        this.connected = false;
        this.http = null;
        this.rest = new RESTManager(this);
        this.token = token;
        this.user = null;
        this.ws = null;
        this._shardCount = this.options.shardCount;
        this._shards = [];
    }

    get shards() {
        if (!this.isSharded) 
            throw new TypeError("Client must be sharded to use this getter");
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

    /**
     * Connect the bot to Discord gateway
     * @returns {Promise<void>}
     */
    connect() {
        this.start(this.token);
    }

    /**
     * Create a message
     * @param {String} channelID The ID of the channel
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<String>} [content.embeds] An array of embed objects
     * @param {Object} [content.messageReference] The message reference used when replying to messages
     * @param {String} [content.messageReference.channelID] The ID of the channel where the message was referenced
     * @param {Boolean} [content.messageReference.failIfNotExists] Whether to throw an error when the message reference doesn't exist
     * @param {String} [content.messageReference.guildID] The ID of the guild where the message was referenced
     * @param {String} content.messageReference.messageID The ID of the message which was referenced
     * @param {Boolean} [content.tts] Whether to send message as Text-to-Speech (TTS)
     * @returns {Promise<Message>}
     */
    createMessage(channelID, content) {
        if (content !== undefined) {
            if (content.content !== undefined && typeof content.content !== "string") {
                content.content = content.content;
            } else if (content.content === undefined && !content.embeds) {
                return new DiscordError("No content or embeds");
            }
            if (content.messageReference) {
                content.message_reference = content.messageReference;
                if(content.messageReference.messageID !== undefined) {
                    content.message_reference.message_id = content.messageReference.messageID;
                    content.messageReference.messageID = undefined;
                }
                if(content.messageReference.channelID !== undefined) {
                    content.message_reference.channel_id = content.messageReference.channelID;
                    content.messageReference.channelID = undefined;
                }
                if(content.messageReference.guildID !== undefined) {
                    content.message_reference.guild_id = content.messageReference.guildID;
                    content.messageReference.guildID = undefined;
                }
                if(content.messageReference.failIfNotExists !== undefined) {
                    content.message_reference.fail_if_not_exists = content.messageReference.failIfNotExists;
                    content.messageReference.failIfNotExists = undefined;
                }
            }
        }
        return this.rest.request(this.rest.route("POST", Endpoints.CHANNEL_MESSAGES(channelID)), content).then((msgObject) => new Message(this, msgObject));
    }

    /**
     * Edit a message
     * @param {String} channelID The ID of the channel 
     * @param {String} messageID The ID of the message
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<String>} [content.embeds] An array of embed objects
     * @param {Number} [content.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(channelID, messageID, content) {
        if (content !== undefined) {
            if (content.content !== undefined && typeof content.content !== "string") {
                content.content = content.content;
            } else if (content.content === undefined && !content.embeds && content.flags) {
                return new DiscordError("No content, embeds, or flags");
            } 
        }
        return this.rest.request(this.rest.route("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID)), content).then((msgObject) => new Message(this, msgObject));
    }
}

module.exports = Client;