"use strict";

const Channel = require("./structures/Channel");
const Collection = require("./utils/Collection");
const Constants = require("./Constants");
const { DiscordError } = require("./errors/DiscordErrors");
const DMChannel = require("./structures/DMChannel");
const Endpoints = require("./managers/Endpoints");
const { EventEmitter } = require("events");
const Guild = require("./structures/Guild");
const HTTPManager = require("./managers/HTTPManager");
const Member = require("./structures/Member");
const Message = require("./structures/Message");
const Permission = require("./structures/Permission");
const RESTManager = require("./managers/RESTManager");
const Role = require("./structures/Role");
const Shard = require("./core/Shard");
const User = require("./structures/User");

/**
 * Represents Yuko main client
 * @extends EventEmitter
 * @property {Collection<Channel>} channels Collection of channels from all guilds
 * @property {Boolean} connected Whether the bot is connected to the gateway or not
 * @property {Shard} gateway The gateway connection
 * @property {Collection<Guild>} guilds Collection of guilds
 * @property {Collection<Message>} messages Collection of messages
 * @property {RESTManager} rest The REST manager
 * @property {Collection<Shard>} shards Collection of shards
 * @property {Number} startupTimestamp The startup timestamp of the bot
 * @property {String} token The token of the bot
 * @property {Number} uptime The current uptime of the bot
 * @property {ClientUser} user The bot user itself
 * @property {Collection<User>} users Collection of users
 */
class Client extends EventEmitter {
    /**
     * Create a client
     * @param {String} token The token of the bot
     * @param {Object} options Yuko client options
     * @param {Object} [options.allowedMentions] A list of mentions to allow by default when creating/editing messages
     * @param {Boolean} [options.allowedMentions.roles=true] Whether to allow mention roles or not
     * @param {Boolean} [options.allowedMentions.users=true] Whether to allow mentions users or not
     * @param {Boolean} [options.autoReconnect] Whether to allow Yuko to auto reconnect 
     * @param {String} [options.imageFormat="png"] The default image format for avatars/icons. Default is "png"
     * @param {String} [options.imageSize=128] The default image size for avatars/icons. Default is 128
     * @param {Number | Array<String | Number>} [options.intents] The intents applied
     * @param {Number} [options.messageCacheLimit=125] The total message limit to cache
     * @param {Number | String} [options.shardCount="auto"] The total shards count for the bot to run
     */
    constructor(token, options) {
        super();

        this.options = Object.assign({
            allowedMentions: {
                roles: true,
                users: true
            },
            autoReconnect: true,
            imageFormat: "png",
            imageSize: 128,
            intents: 0,
            messageCacheLimit: 125,
            shardCount: "auto"
        }, options);

        this.options.allowedMentions = this._formatAllowedMentions(this.options.allowedMentions);

        if (this.options.hasOwnProperty("intents")) {
            if (Array.isArray(this.options.intents)) {
                let bit = 0;

                for (const intent of this.options.intents) {
                    if (Constants.GatewayIntents[intent]) {
                        bit |= Constants.GatewayIntents[intent];
                    } else {
                        this.emit("warning", `Invalid Intent: ${intent}`);
                    }
                }

                this.options.intents = bit;
            }
        }

        this.channels = new Collection(Channel);
        this.connected = false;
        this.gateway = null;
        this.guilds = new Collection(Guild);
        this.messages = new Collection(Message, this.options.messageCacheLimit);
        this.users = new Collection(User);
        this.http = null;
        this.rest = new RESTManager(this);
        this.shards = new Collection(Shard);
        this.startupTimestamp = 0;
        this.token = token;
        this.user = null;
        this._shards = [];
    }

    /**
     * Add a role to a guild member
     * @param {String} guildID The ID of the guild
     * @param {String} memberID The ID of the member
     * @param {String} roleID The ID of the role
     * @returns {Promise<void>}
     */
    addGuildMemberRole(guildID, memberID, roleID) {
        return this.rest.request("PUT", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID));
    }

    /**
     * Add a reaction to a message
     * @param {String} channelID The ID of the channel
     * @param {String} messageID The ID of the message
     * @param {String} reaction The reaction. `name:id` for custom emoji
     * @returns {Promise<void>}
     */
    addMessageReaction(channelID, messageID, reaction) {
        if (reaction === decodeURI(reaction)) {
            reaction = encodeURIComponent(reaction);
        }

        return this.rest.request("PUT", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, "@me"));
    }

    /**
     * Ban a member from a guild
     * @param {String} guildID The ID of the guild
     * @param {String} memberID The ID of the member
     * @param {Number} [deleteMessageDays=0] Number of days to delete messages for
     * @returns {Promise<void>}
     */
    banGuildMember(guildID, memberID, deleteMessageDays) {
        return this.rest.request("PUT", Endpoints.GUILD_BAN(guildID, memberID), {
            delete_message_days: deleteMessageDays ? deleteMessageDays : 0
        });
    }

    /**
     * Bulk delete multiple messages
     * @param {String} channelID The ID of the channel 
     * @param {Array<String>} messageIDs An array of the message IDs
     * @returns {Promise<void>}
     */
    bulkDeleteMessages(channelID, messageIDs) {
        if (messageIDs.length === 1) {
            return this.deleteMessage(channelID, messageIDs[0]);
        }

        const messageMoreThanTwoWeeks = messageIDs.find((messageID) => messageID < (Date.now() - 1421280000000) * 4194304);

        if (messageMoreThanTwoWeeks) {
            return DiscordError(`Message ${messageMoreThanTwoWeeks} is more than 2 weeks old`);
        }

        if (messageIDs.length > 100) {
            return this.rest.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), {
                messages: messageIDs.splice(0, 100)
            }).then(() => this.bulkDeleteMessages(channelID, messageIDs));
        }

        return this.rest.request("POST", Endpoints.CHANNEL_BULK_DELETE(channelID), {
            messages: messageIDs
        });
    }

    /**
     * Connect the bot to Discord gateway
     * @returns {Promise<void>}
     */
    connect() {
        this._start(this.token);
    }

    /**
     * Create a guild role
     * @param {String} guildID The ID of the guild
     * @param {Object} options The role options
     * @param {Number} [options.color] The color of the role. Must be in hex code form (eg. 0x7289DA)
     * @param {Boolean} [options.hoist] Whether the role should be hoisted or not
     * @param {String} [options.icon] The role's image icon. Icon image must be as base64 data URI
     * @param {Boolean} [options.mentionable] Whether the role is mentionable or not
     * @param {String} [options.name] The name of the role
     * @param {String} [options.unicodeEmoji] The emoji of the role
     * @param {BigInt | Number | String | Permission} [options.permissions] The permissions granted to the role
     * @param {String} [options.reason] The reason which will be displayed in the audit log
     * @returns {Promise<Role>}
     */
    createGuildRole(guildID, options) {
        if (options.permissions !== undefined) {
            options.permissions = options.permissions instanceof Permission ? String(options.permissions.allow) : String(options.permissions);
        }

        return this.rest.request("POST", Endpoints.GUILD_ROLES(guildID), {
            color: options.color,
            hoist: options.hoist,
            icon: options.icon,
            mentionable: options.mentionable,
            name: options.name,
            unicode_emoji: options.unicodeEmoji,
            permissions: options.permissions,
            reason: options.reason
        }).then((role) => new Role(this, this.guilds.get(guildID), role));
    }

    /**
     * Create a message
     * @param {String} channelID The ID of the channel
     * @param {Object} options The message options
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
                options.content = `${options.content}`;
            } else if (options.embed && !options.embeds) {
                options.embeds = [];
                options.embeds.push(options.embed);
            } else if (options.embed && options.embeds) {
                options.embeds = [options.embed, ...options.embeds];
            }

            if (options.content === undefined && !options.embeds) {
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
     * Create a DM Channel with a user
     * @param {String} userID The ID of the user
     * @returns {Promise<DMChannel>}
     */
    createUserDM(userID) {
        return this.rest.request("POST", Endpoints.USER_CHANNELS("@me"), {
            recipients: [userID],
            type: Constants.ChannelTypes.DM
        }).then((dmChannel) => new DMChannel(this, dmChannel));
    }

    /**
     * Delete a guild role
     * @param {String} guildID The ID of the guild
     * @param {String} roleID The ID of the role
     * @param {String} [reason] The reason which will be displayed in the audit log
     * @returns {Promise<void>}
     */
    deleteGuildRole(guildID, roleID, reason) {
        return this.rest.request("DELETE", Endpoints.GUILD_ROLE(guildID, roleID), {
            reason
        });
    }

    /**
     * Delete a message
     * @param {String} channelID The ID of the channel
     * @param {String} messageID The ID of the message
     * @param {String} [reason] The reason which will be displayed in the audit log
     * @returns {Promise<void>}
     */
    deleteMessage(channelID, messageID, reason) {
        return this.rest.request("DELETE", Endpoints.CHANNEL_MESSAGE(channelID, messageID), {
            reason
        });
    }

    /**
     * Edit a guild
     * @param {String} guildID The ID of the guild
     * @param {Object} options The options properties
     * @param {String} [options.afkChannelID] The ID of the AFK channel
     * @param {Number} [options.afkTimeout] The timeout of AFK in voice channels (in seconds)
     * @param {String} [options.banner] The banner of the guild. Banner image must be as base64 data URI
     * @param {Number} [options.defaultMessageNotifications] The default message notifications of the guild
     * @param {String} [options.description] The description of the guild
     * @param {String} [options.discoverySplash] The discovery splash of the guild. Discoery splash image must be as base 64 URI
     * @param {Number} [options.explicitContentFilter] The explicit content filter level of the guild
     * @param {Array<String>} [options.features] The enabled features of the guild
     * @param {String} [options.icon] The icon of the guild. Icon image must be as base64 data URI
     * @param {String} [options.name] The name of the guild
     * @param {String} [options.ownerID] The ID of the owner which wil be transferred to
     * @param {String} [options.preferredLocale] The preferred guild language
     * @param {String} [options.publicUpdatesChannelID] The ID of the channel where guild admins will receive Discord notifications
     * @param {String} [options.rulesChannelID] The ID of the rule channel
     * @param {String} [options.splash] The splash of the guild. Splash image must be as base64 data URI
     * @param {Number} [options.systemChannelFlags] The flags for the system channel
     * @param {String} [options.systemChannelID] The ID of the system channel
     * @param {Number} [options.verificationLevel] The verification level
     * @returns {Promise<Guild>}
     */
    editGuild(guildID, options) {
        return this.rest.request("PATCH", Endpoints.GUILD(guildID), {
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            banner: options.banner,
            default_message_notifications: options.defaultMessageNotifications,
            description: options.description,
            discovery_splash: options.discoverySplash,
            explicit_content_filter: options.explicitContentFilter,
            features: options.features,
            icon: options.icon,
            name: options.name,
            owner_id: options.ownerID,
            preferred_locale: options.preferredLocale,
            public_updates_channel_id: options.publicUpdatesChannelID,
            rules_channel_id: options.rulesChannelID,
            splash: options.splash,
            system_channel_flags: options.systemChannelFlags,
            system_channel_id: options.systemChannelID,
            verification_level: options.verificationLevel
        }).then((guild) => new Guild(this, guild));
    }

    /**
     * Edit a guild member
     * @param {String} guildID The ID of the guild
     * @param {String} memberID The ID of the member
     * @param {Object} options The options properties
     * @param {String} [options.channelID] The ID of the voice channel to move the user to
     * @param {Boolean} [options.deaf] Deafen the member
     * @param {Boolean} [options.mute] Mute the member
     * @param {String} [options.nick] Set the member's nickname
     * @param {Array<String>} [options.roles] An array of role IDs to be add to member
     * @returns {Promise<Member>}
     */
    editGuildMember(guildID, memberID, options) {
        return this.rest.request("PATCH", Endpoints.GUILD_MEMBER(guildID, memberID), {
            channel_id: options.channelID,
            deaf: options.deaf,
            mute: options.mute,
            nick: options.nick,
            roles: options.roles
        }).then((member) => new Member(this.guilds.get(guildID), member));
    }

    /**
     * Edit a guild role
     * @param {String} guildID The ID of the guild
     * @param {String} roleID The ID of the role
     * @param {Object} options The role options
     * @param {Number} [options.color] The color of the role. Must be in hex code form (eg. 0x7289DA)
     * @param {Boolean} [options.hoist] Whether the role should be hoisted or not
     * @param {String} [options.icon] The role's image icon. Icon image must be as base64 data URI
     * @param {Boolean} [options.mentionable] Whether the role is mentionable or not
     * @param {String} [options.name] The name of the role
     * @param {String} [options.unicodeEmoji] The emoji of the role
     * @param {BigInt | Number | String | Permission} [options.permissions] The permissions granted to the role
     * @returns {Promise<Role>}
     */
    editGuildRole(guildID, roleID, options) {
        if (!options.permissions) {
            options.permissions = options.permissions instanceof Permission ? String(options.permissions.allow) : String(options.permissions);
        }

        return this.rest.request("PATCH", Endpoints.GUILD_ROLE(guildID, roleID), {
            color: options.color,
            hoist: options.hoist,
            icon: options.icon,
            mentionable: options.mentionable,
            name: options.name,
            unicode_emoji: options.unicodeEmoji,
            permissions: options.permissions
        }).then((role) => new Role(this, this.guilds.get(guildID), role));
    }

    /**
     * Edit a message
     * @param {String} channelID The ID of the channel 
     * @param {String} messageID The ID of the message
     * @param {Object} options The message options
     * @param {String} [options.content] The message options
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Number} [options.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(channelID, messageID, options) {
        if (options !== undefined) {
            if (options.content !== undefined && typeof options.content !== "string") {
                options.content = `${options.content}`;
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

    /**
     * Remove a member from a guild
     * @param {String} guildID The ID of the guild
     * @param {String} memberID The ID of the member
     * @returns {Promise<void>}
     */
    removeGuildMember(guildID, memberID) {
        return this.rest.request("DELETE", Endpoints.GUILD_MEMBER(guildID, memberID));
    }

    /**
     * Remove a role from a guild member
     * @param {String} guildID The ID of the guild
     * @param {String} memberID The ID of the member
     * @param {String} roleID The ID of the role
     * @returns {Promise<void>} 
     */
    removeGuildMemberRole(guildID, memberID, roleID) {
        return this.rest.request("DELETE", Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID));
    }

    /**
     * Remove a reaction from a message
     * @param {String} channelID The ID of the channel
     * @param {String} messageID The ID of the message
     * @param {String} reaction The reaction. `name:id` if custom emoji
     * @param {String} [userID="@me"] The ID of the user of the reaction
     * @returns {Promise<void>}
     */
    removeMessageReaction(channelID, messageID, reaction, userID) {
        return this.rest.request("DELETE", Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, userID || "@me"));
    }

    get uptime() {
        return this.startupTimestamp ? Date.now() - this.startupTimestamp : 0;
    }

    _establishHTTP() {
        this.http = new HTTPManager(this);
    }

    async _establishWebsocket() {
        this.gateway = new Shard(this);

        return await (async() => {
            if (!this.options.shardCount || this.options.shardCount === "auto") {
                return await this.http.getDefaultShardCount();
            }

            return this.options.shardCount;
        })().then((count) => {
            this.options.shardCount = count;

            for (let i = 0; i < count; i++) {
                const shard = new Shard(this, i);
                this._shards.push(shard);
                this.shards.add(shard);
            }

            this.gateway = this._shards[0];
        });
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

    async _start(token) {
        this.token = token;
        this._establishHTTP();
        await this._establishWebsocket();
        this._startShards();
    }

    _startShards() {
        this.shards.forEach((shard) => {
            shard.start();
            shard.connected = true;
        });
    }
}

module.exports = Client;