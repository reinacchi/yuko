"use strict";

const Base = require("./Base");
const User = require("./User");

/**
 * Represents a guild members
 */
class Member extends Base {
    constructor(client, guild, data) {
        super(client, data.user);

        this.client = client;
        this.data = data;
        this.guild = guild;
        this._load(data);
    }

    _load(data) {
        if (data.user) {
            this.user = new User(this.client, data.user);
        }

        this.deafened = data.deaf;
        this.nick = data.nick;
        this.muted = data.mute;
        this.joinedAt = new Date(Date.parse(data.joined_at));
    }

    toUser() {
        if (this.user) {
            return this.user;
        }

        if (this.data.user) {
            return new User(this.client, this.data.user);
        }
    }
}

module.exports = Member;