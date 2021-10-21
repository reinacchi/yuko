"use strict";

const Channel = require("./structures/Channel");
const Collection = require("./utils/Collection");
const Constants = require("./Constants");
const { DiscordError, InvalidToken } = require("./errors/DiscordErrors");
const DMChannel = require("./structures/DMChannel");
const Endpoints = require("./managers/Endpoints");
const { EventEmitter } = require("events");
const Guild = require("./structures/Guild");
const Message = require("./structures/Message");
const HTTPManager = require("./managers/HTTPManager");
const RESTManager = require("./managers/RESTManager");
const Shard = require("./core/Shard");
const User = require("./structures/User");

/**
 * Represents Yuko main client
 * @extends EventEmitter
 * @property {Collection<Channel>} channels Collection of channels from all guilds
 * @property {Boolean} connected Whether the bot is connected to the gateway or not
 * @property {Collection<Guild>} guilds Collection of guilds
 * @property {Collection<Message>} messages Collection of messages
 * @property {RESTManager} rest The REST manager
 * @property {Collection<Shard>} shards Collection of shards
 * @property {Number} startupTimestamp The startup timestamp of the bot
 * @property {String} token The token of the bot
 * @property {Number} uptime The current uptime of the bot
 * @property {ClientUser} user The bot user itself
 * @property {Collection<User>} users Collection of users
 * @property {Shard} ws The Websocket connection
 */
class Client extends EventEmitter {
    /**
     * Create a client
     * @param {String} token The token of the bot
     * @param {Object} options Yuko client options
     * @param {Object} [options.allowedMentions] A list of mentions to allow by default when creating/editing messages
     * @param {Boolean} [options.allowedMentions.roles=true] Whether to allow mention roles or not
     * @param {Boolean} [options.allowedMentions.users=true] Whether to allow mentions users or not
     * @param {String} [options.imageFormat="png"] The default image format for avatars/icons. Default is "png"
     * @param {String} [options.imageSize=128] The default image size for avatars/icons. Default is 128
     * @param {Number | Array<String | Number>} options.intents The intents applied
     * @param {Number} [options.messageCacheLimit=125] The total message limit to cache
     * @param {Number | String} [options.shardCount="auto"] The total shards count for the bot to run
     */
    constructor(token, options) {
        super();

        this.options = Object.assign({
            allowedMentions: {
                roles: true,
                users: true,
            },
            imageFormat: "png",
            imageSize: 128,
            messageCacheLimit: 125,
            shardCount: "auto"
        }, options);

        this.options.allowedMentions = this._formatAllowedMentions(this.options.allowedMentions);

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

        this.channels = new Collection(Channel);
        this.connected = false;
        this.guilds = new Collection(Guild);
        this.messages = new Collection(Message, options.messageCacheLimit);
        this.users = new Collection(User);
        this.http = null;
        this.rest = new RESTManager(this);
        this.shards = new Collection(Shard);
        this.startupTimestamp = 0;
        this.token = token;
        this.user = null;
        this.ws = null;
        this._shards = [];
    }

    /**
     * Connect the bot to Discord gateway
     * @returns {Promise<void>}
     */
    connect() {
        this._start(this.token);
    }

    /**
     * Create a DM Channel with a user
     * @param {String} userID The ID of the user
     * @returns {Promise<DMChannel>}
     */
    createDM(userID) {
        return this.rest.request(this.rest.route("POST", Endpoints.USER_CHANNELS("@me")), {
            recipients: [userID],
            type: Constants.ChannelTypes.DM
        }).then((dmChannel) => new DMChannel(this, dmChannel));
    }

    /**
     * Create a message
     * @param {String} channelID The ID of the channel
     * @param {Object} options An object of options
     * @param {String} [options.content] The message options
     * @param {Object} [options.embed] An embed objects. Use `options.embeds` to send multiple embeds
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Object} [options.messageReference] The message reference used when replying to messages
     * @param {String} [options.messageReference.channelID] The ID of the channel where the message was referenced
     * @param {Boolean} [options.messageReference.failIfNotExists] Whether to throw an error when the message reference doesn't exist
     * @param {String} [options.messageReference.guildID] The ID of the guild where the message was referenced
     * @param {String} options.messageReference.messageID The ID of the message which was referenced
     * @param {Boolean} [options.tts] Whether to send message as Text-to-Speech (TTS)
     * @returns {Promise<Message>}
     */
    createMessage(channelID, options) {
        if (options !== undefined) {
            if (options.content !== undefined && typeof options.content !== "string") {
                options.content = options.content;
            } else if (options.content === undefined && !options.embeds) {
                return new DiscordError("No content or embeds");
            }
            
            options.allowed_mentions = this._formatAllowedMentions(options.allowedMentions);
            if (options.messageReference) {
                options.message_reference = options.messageReference;
                if (options.messageReference.messageID !== undefined) {
                    options.message_reference.message_id = options.messageReference.messageID;
                    options.messageReference.messageID = undefined;
                }
                if (options.messageReference.channelID !== undefined) {
                    options.message_reference.channel_id = options.messageReference.channelID;
                    options.messageReference.channelID = undefined;
                }
                if (options.messageReference.guildID !== undefined) {
                    options.message_reference.guild_id = options.messageReference.guildID;
                    options.messageReference.guildID = undefined;
                }
                if (options.messageReference.failIfNotExists !== undefined) {
                    options.message_reference.fail_if_not_exists = options.messageReference.failIfNotExists;
                    options.messageReference.failIfNotExists = undefined;
                }
            }
        }
        return this.rest.request("POST", Endpoints.CHANNEL_MESSAGES(channelID), options).then((msg) => new Message(this, msg));
    }

    /**
     * Delete a message
     * @param {String} channelID The ID of the channel
     * @param {String} messageID The ID of the message
     * @returns {Promise<void>}
     */
    deleteMessage(channelID, messageID) {
        return this.rest.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID));
    }

    /**
     * Edit a message
     * @param {String} channelID The ID of the channel 
     * @param {String} messageID The ID of the message
     * @param {Object} options An object of options
     * @param {String} [options.content] The message options
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Number} [options.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(channelID, messageID, options) {
        if (options !== undefined) {
            if (options.content !== undefined && typeof options.content !== "string") {
                options.content = options.content;
            } else if (options.content === undefined && !options.embeds && options.flags) {
                return new DiscordError("No content, embeds, or flags");
            }
        }
        return this.rest.request("PATCH", Endpoints.CHANNEL_MESSAGE(channelID, messageID), options).then((msg) => new Message(this, msg));
    }

    /**
     * Get multiple messages in a channel
     * Todo: Options
     * @param {String} channelID The ID of the channel
     * @returns {Promise<Array<Message>>}
     */
    async getMessages(channelID) {
        const messages = await this.rest.request("GET", Endpoints.CHANNEL_MESSAGES(channelID));
        return messages.map((msg) => {
            return new Message(this, msg);
        });
    }

    get uptime() {
        return this.startupTimestamp ? Date.now() - this.startupTimestamp : 0;
    }

    async _start(token) {
        this.token = token;
        this._establishHTTP();
        await this._establishWebsocket();
        this._startShards();
    }

    _formatAllowedMentions(allowed) {
        if (!allowed) {
            return this.options.allowedMentions;
        }
        const result = {
            parse: []
        };
        if (allowed.everyone) {
            result.parse.push("everyone");
        }
        if (allowed.roles === true) {
            result.parse.push("roles");
        } else if (Array.isArray(allowed.roles)) {
            if (allowed.roles.length > 100) {
                throw new DiscordError("Allowed role mentions cannot exceed 100.");
            }
            result.roles = allowed.roles;
        }
        if (allowed.users === true) {
            result.parse.push("users");
        } else if (Array.isArray(allowed.users)) {
            if (allowed.users.length > 100) {
                throw new DiscordError("Allowed user mentions cannot exceed 100.");
            }
            result.users = allowed.users;
        }
        if (allowed.repliedUser !== undefined) {
            result.replied_user = allowed.repliedUser;
        }
        return result;
    }

    _formatImage(url, format, size) {
        if (!format || !Constants.ImageFormatTypes.includes(format.toLowerCase())) {
            format = url.includes("/a_") ? "gif" : this.options.imageFormat;
        }
        if (!size || size < Constants.ImageSizes.MAXIMUM || size > Constants.ImageSizes.MAXIMUM) {
            size = this.options.imageSize;
        }
        return `${Endpoints.CDN_URL}${url}.${format}?size=${size}`;
    }

    _establishHTTP() {
        this.http = new HTTPManager(this);
    }

    async _establishWebsocket() {
        this.ws = new Shard(this);

        return await (async () => {
            if (!this.options.shardCount || this.options.shardCount === "auto") {
                return await this.http.getDefaultShardCount();
            }

            return this.options.shardCount
        })().then(count => {
            this.options.shardCount = count;
            for (let i = 0; i < count; i++) {
                const shard = new Shard(this, i);
                this._shards.push(shard);
                this.shards.add(shard);
            }
            this.ws = this._shards[0];
        });
    }

    _startShards() {
        this.shards.forEach((shard) => {
            shard.start();
            shard.connected = true;
        });
    }
}

module.exports = Client;