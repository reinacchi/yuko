"use strict";

const Base = require("./Base");
const User = require("./User");

/**
 * Represents a guild members
 * @extends {Base}
 * @property {Boolean} deafened Whether the member was deafened or not
 * @property {Guild} guild The guild
 * @property {Number} joinedAt The timestamp of when the member was created at
 * @property {Boolean} muted Whether the member muted or not
 * @property {String} nick The nickname of the member
 * @property {User} user The user 
 */
class Member extends Base {
    constructor(guild, data) {
        super(data.id || data.user.id);

        this.data = data;
        this.guild = guild;
        this.roles = [];
        this._load(data);
    }

    get bot() {
        return this.user.bot;
    }

    get username() {
        return this.user.username;
    }

    /**
     * Add a role to a guild member
     * @param {String} roleID The ID of the role
     * @returns {Promise<void>}
     */
    addRole(roleID) {
        return this.guild.client.addGuildMemberRole(this.guild.id, this.id, roleID);
    }

    /**
     * Edit a guild member
     * @param {Object} options The options properties
     * @param {String} [options.channelID] The ID of the voice channel to move the user to
     * @param {Boolean} [options.deaf] Deafen the member
     * @param {Boolean} [options.mute] Mute the member
     * @param {String} [options.nick] Set the member's nickname
     * @param {Array<String>} [options.roles] An array of role IDs to be add to member
     * @returns {Promise<Member>}
     */
    edit(options) {
        return this.guild.client.editGuildMember(this.guild.id, this.id, options);
    }

    removeRole(roleID) {
        return this.guild.client.removeGuildMemberRole(this.guild.id, this.id, roleID);
    }

    /**
     * Get the user data only
     * @returns {User}
     */
    toUser() {
        if (this.user) {
            return this.user;
        }

        if (this.data.user) {
            return new User(this.client, this.data.user);
        }
    }

    _load(data) {
        this.deafened = data.deaf;
        this.nick = data.nick;
        this.muted = data.mute;
        this.joinedAt = new Date(Date.parse(data.joined_at));

        if (data.user) {
            this.user = new User(this.client, data.user);
            this.guild.client.users.add(this.user);
        }

        if (data.roles) {
            this.roles = data.roles;
        }
    }
}

module.exports = Member;