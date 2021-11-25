"use strict";

const Base = require("./Base");
const Endpoints = require("../managers/Endpoints");
const Permission = require("./Permission");

/**
 * Represents a role
 * @extends {Base}
 * @property {Number} color The color of the role in hexdecimal color code
 * @property {Guild} guild The guild of where the role was found
 * @property {Boolean} hoist Whether the role is hoisted or not
 * @property {String} id The ID of the role
 * @property {Boolean} managed Whether the role is managed by an integration or not
 * @property {Boolean} mentionable Whether the role is mentionable or not
 * @property {String} name The name of the role
 * @property {Permission} permissions The permissions of the role
 * @property {Number} position The position of the role 
 */
class Role extends Base {
    constructor(client, guild, data) {
        super(data.id);

        this.client = client;
        this.guild = guild;

        if (data) {
            this._load(data);
        }
    }

    get iconURL() {
        return this.icon ? this.client._formatImage(Endpoints.ROLE_ICON(this.id, this.icon)) : null;
    }

    /**
     * Delete a guild role
     * @param {String} [reason] The reason which will be displayed in the audit log
     * @returns {Promise<void>}
     */
    delete(reason) {
        return this.client.deleteGuildRole(this.guild.id, this.id, reason);
    }

    /**
     * Edit a guild role
     * @param {Object} options The role options
     * @param {Number} [options.color] The color of the role. Must be in hex code form (eg. 0x7289DA)
     * @param {Boolean} [options.hoist] Whether the role should be hoisted or not
     * @param {String} [options.icon] The role's image icon. Icon image must be as base64 data URI
     * @param {Boolean} [options.mentionable] Whether the role is mentionable or not
     * @param {String} [options.name] The name of the role
     * @param {String} [options.unicodeEmoji] The emoji of the role
     * @param {BigInt | Number | String | Permission} [options.permissions] The permissions granted to the role
     * @param {String} [options.reason] The reason which will be displayed in the audit log
     * @returns {Promise<Role>}
     */
    edit(options) {
        return this.client.editGuildRole(this.guild.id, this.id, options);
    }

    _load(data) {
        this.color = data.color;
        this.hoist = data.hoist;
        this.icon = data.icon;
        this.managed = data.managed;
        this.mentionable = data.mentionable;
        this.name = data.name;
        this.permissions = new Permission(data.permissions);
        this.position = data.position;
        this.tags = data.tags;
        this.unicodeEmoji = data.unicode_emoji;
    }
}

module.exports = Role;