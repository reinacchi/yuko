"use strict";

const Channel = require("./Channel");

/**
 * Represents a channel found in a guild
 * @extends {Channel}
 * @property {Guild} guild The guild
 * @property {String} id The ID of the guild channel
 * @property {String} name The name of the guild channel
 * @property {Number} position The position of the guild channel
 */
class GuildChannel extends Channel {
    constructor(client, data) {
        super(client, data);

        this.client = client;

        if (data) this._load(data);
    }
    _load(data) {
        this.guild = this.client.guilds.get(data.guild_id);
        this.id = data.id;
        this.position = data.position;
        this.name = data.name
    }
}

module.exports = GuildChannel;