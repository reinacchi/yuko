"use strict";

const Base = require("./Base");
const User = require("./User");

/**
 * Represents a message
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
                this.member = this.guild.members.get(this.author.id)
            } else {
                this.member = null;
            }
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
     * @param {String} channelID The ID of the channel 
     * @param {String} messageID The ID of the message
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<String>} [content.embeds] An array of embed objects
     * @param {Number} [content.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    edit(content) {
        return this.client.editMessage.call(this.client, this.channelID, this.id, content);
    }
}

module.exports = Message;