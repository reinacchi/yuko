"use strict";

const Base = require("./Base");
const User = require("./User");

/**
 * Represents a message
 * @extends {Base}
 * @property {Array<Object>} attachments An array of attachments
 * @property {User} author The author of the message
 * @property {String} channelID The ID of the channel
 * @property {TextChannel} channel The channel where the message was created
 * @property {Array<Object>} components An array of components
 * @property {String} options The options of the message
 * @property {Number?} editedTimestamp The edited timestamp of the latest message edit
 * @property {Array<Object>} embeds An array of embeds 
 * @property {Number} flags Message flags
 * @property {Guild} guild The guild where the message was created
 * @property {String} guilID The ID of the guild
 * @property {String} id The ID of the message
 * @property {Member?} member The author of the message with server-specific data
 * @property {Object?} messageReference The message reference showing the source of a crosspost, channel follow add, pin, or a reply
 * @property {String?} messageReference.channelID The ID of the channel where the message was referenced
 * @property {String?} messageReference.guilID The ID of the guild where the message was referenced
 * @property {String?} messageReference.messageID The ID of the referenced message
 * @property {Boolean} pinned Whether the message was pinned or not
 * @property {Array<Object>} reactions An array of reactions
 * @property {Array<Object>?} stickerItems An array of message stickers 
 * @property {Number} timestamp The timestamp when the message was sent
 * @property {Boolean} tts Whether the message was sent as Text-to-Speech or not
 * @property {Number} type The type of the message
 */
class Message extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.channel = client.channels.get(data.channel_id);
        this.guild = client.guilds.get(data.guild_id);

        if (data) {
            this._load(data);
        }
    }

    /**
     * Create a message
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
    create(options) {
        return this.client.createMessage(this.channelID, options);
    }

    /**
     * Delete the message
     * @returns {Promise<void>}
     */
    delete() {
        return this.client.deleteMessage(this.channelID, this.id);
    }

    /**
     * Edit a message
     * @param {Object} options The message options
     * @param {String} [options.content] The message options
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Number} [options.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    edit(options) {
        return this.client.editMessage(this.channelID, this.id, options);
    }

    /**
     * Add a reaction to a message
     * @param {String} reaction The reaction. `name:id` for custom emoji
     * @returns {Promise<void>}
     */
    react(reaction) {
        return this.client.addMessageReaction(this.channelID, this.id, reaction);
    }

    /**
     * Reply to a message
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
    reply(options) {
        return this.client.createMessage(this.channelID, { messageReference: { messageID: this.id }, ...options });
    }

    /**
     * Remove a reaction from a message
     * @param {String} reaction The reaction. `name:id` for custom emoji
     * @param {String} userID The ID of the user of the reaction
     * @returns {Promise<void>}
     */
    unreact(reaction, userID) {
        return this.client.removeMessageReaction(this.channel, this.id, reaction, userID || "@me");
    }

    _load(data) {
        this.author = new User(this.client, data.author);
        this.channelID = data.channel_id;
        this.components = data.components;
        this.content = data.content;
        this.embeds = data.embeds;
        this.flags = data.flags || 0;
        this.guildID = data.guild_id;
        this.id = data.id;
        this.pinned = data.pinned;
        this.reactions = data.reactions;
        this.stickerItems = data.sticker_items;
        this.timestamp = data.timestamp;
        this.tts = data.tts;
        this.type = data.type;

        if (data.edited_timestamp) {
            this.editedTimestamp = new Date(Date.parse(data.edited_timestamp));
        }

        if (data.message_reference) {
            this.messageReference = {
                messageID: data.message_reference.message_id,
                channelID: data.message_reference.channel_id,
                guildID: data.message_reference.guild_id
            };
        } else {
            this.messageReference = null;
        }

        if (this.guild) {
            if (data.member) {
                data.member.id = this.author.id;

                if (data.author) {
                    data.member.user = data.author;
                }

                this.member = this.guild.members.update(this.guild, data.member);
            } else if (this.guild.members.has(this.author.id)) {
                this.member = this.guild.members.get(this.author.id);
            } else {
                this.member = null;
            }

            if (!this.guildID) {
                this.guildID = this.guild.id;
            }
        } else {
            this.member = null;
        }

    }
}

module.exports = Message;