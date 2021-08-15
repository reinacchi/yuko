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

    edit(content) {
        return this.client.editMessage.call(this.client, this.channelID, this.id, content);
    }
}

module.exports = Message;