"use strict";

const Base = require("./Base");
const User = require("./User");
const Member = require("./Member");

/**
 * Represents a message
 * @extends {Base}
 * @property {User} author The author of the message
 * @property {String} channelID The ID of the channel
 * @property {TextChannel} channel The channel where the message was created
 * @property {String} content The content of the message
 * @property {Array<Object>} embeds An array of embeds 
 * @property {Guild} guild The guild where the message was created
 * @property {String} guilID The ID of the guild
 * @property {String} id The ID of the message
 * @property {Member} member The author of the message with server-specific data
 * @property {Boolean} pinned Whether the message was pinned or not
 * @property {Boolean} tts Whether the message was sent as Text-to-Speech or not
 * @property {Number} type The type of the message
 */
class Message extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.channel = client.channels.get(data.channel_id);
        this.guild = client.guilds.get(data.guild_id);

        if (data) this._load(data);
    }

    _load(data) {
        this.author = new User(this.client, data.author);
        this.channelID = data.channel_id
        this.content = data.content;
        this.embeds = data.embeds;
        this.guildID = data.guild_id;
        this.id = data.id
        this.pinned = data.pinned;
        this.tts = data.tts;
        this.type = data.type;

        if (data.edited_timestamp) {
            this.editedAt = new Date(Date.parse(data.edited_timestamp));
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

    /**
     * Delete the message
     * @returns {Promise<void>}
     */
    delete() {
        return this.client.deleteMessage.call(this.client, this.channelID, this.id);
    }

    /**
     * Edit a message
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<Object>} [content.embeds] An array of embed objects
     * @param {Number} [content.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    edit(content) {
        return this.client.editMessage.call(this.client, this.channelID, this.id, content);
    }
}

module.exports = Message;