"use strict";

const Base = require("./Base");
const { ChannelTypes } = require("../Constants");

/**
 * Represents a various of channels 
 * @extends {Base}
 * @property {Number} createdAt The timestamp of when the channel was created at
 * @property {String} id The ID of the channel
 */
class Channel extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;

        if (data) {
            this._load(data);
        }
    }

    static from(client, data) {
        switch (data.type) {
            case ChannelTypes.GUILD_TEXT: {
                return new TextChannel(client, data);
            }
            case ChannelTypes.DM: {
                return new DMChannel(client, data);
            }
        }
        if (data.guild_id) {
            if (data.last_message_id !== undefined) {
                return new TextChannel(client, data);
            }
            return new GuildChannel(client, data);
        }
        return new Channel(client, data);
    }

    _load(data) {
        this.type = data.type;
    }
}

module.exports = Channel;

const DMChannel = require("./DMChannel");
const GuildChannel = require("./GuildChannel");
const TextChannel = require("./TextChannel");