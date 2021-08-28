"use strict";

const Base = require("./Base");
const { ChannelTypes } = require("../Constants");
const { DiscordError } = require("../errors/DiscordErrors");

/**
 * Represents a various of channels 
 */
class Channel extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        
        if (data) this._load(data);
    }

    _load(data) {
        this.type = data.type;
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
}

module.exports = Channel;

const DMChannel = require("./DMChannel");
const GuildChannel = require("./GuildChannel");
const TextChannel = require("./TextChannel");