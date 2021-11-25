"use strict";

const Base = require("./Base");

/**
 * Represents an invite
 * @extends {Base}
 * @property {String} code The invite code
 * @property {User} inviter The inviter
 */
class Invite extends Base {
    constructor(client, data) {
        super();

        this.client = client;
        this.code = data.code;
        this._createdAt = data.created_at;

        if (data) {
            this._load(data);
        }
    }

    get createdAt() {
        return Date.parse(this._createdAt);
    }

    _load(data) {
        if (data.inviter) {
            this.inviter = this.client.users.add(data.inviter);
        }
    }
}

module.exports = Invite;