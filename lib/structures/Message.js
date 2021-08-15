"use strict";

const Base = require("./Base");
const User = require("./User");

class Message extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.data = data;

        if (data) this._load(data);
    }

    _load(data) {
        this.author = new User(this.client, data.author);
        this.channelID = data.channel_id
        this.content = data.content;
        this.embeds = data.embeds;
        this.id = data.id
        this.pinned = data.pinned;
        this.tts = data.tts;
        this.type = data.type;

        if (data.edited_timestamp) {
            this.editedAt = new Date(Date.parse(data.edited_timestamp));
        }
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