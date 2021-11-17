"use strict";

const Base = require("./Base"); 
const DMChannel = require("./DMChannel");

/**
 * Represents a user
 * @extends {Base}
 * @property {?String} avatar The avatar of the user
 * @property {Boolean} bot Whether the user is a bot-account or not
 * @property {String} discriminator The discriminator of the user
 * @property {String} id The ID of the user
 * @property {Number} publicFlags The public flags of the user
 * @property {Boolean} system Whether the user is part of Discord Official system or not
 * @property {String} username The username of the user
 */
class User extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        
        if (data) {
            this._load(data);
        }
    }

    /**
     * Create a DM channel with a user
     * @returns {Promise<DMChannel>}
     */
    createDM() {
        return this.client.createUserDM(this.id).then((dmChannel) => new DMChannel(this.client, dmChannel));
    }

    _load(data) {
        this.avatar = data.avatar;
        this.id = data.id;
        this.publicFlags = data.public_flags;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.bot = !!data.bot;
        this.system = !!data.system;
    }
}

module.exports = User;