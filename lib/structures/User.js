"use strict";

const Base = require("./Base"); 

/**
 * Represents a user
 */
class User extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.data = data;
        
        if (data) this._load(data);
    }

    _load(data) {
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.bot = data.bot;
        this.system = data.system;
    }

    get tag() {
        return `${this.username}#${this.discriminator}`
    }

    toString() {
        return this.tag;
    }
}

module.exports = User;