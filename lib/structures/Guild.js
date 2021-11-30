"use strict";

const Base = require("./Base");
const Channel = require("./Channel");
const Collection = require("../utils/Collection");
const Endpoints = require("../managers/Endpoints");
const Member = require("./Member");
const Role = require("./Role");

/**
 * Represents a guild
 * @extends {Base}
 * @property {?String} bannerURL The banner URL of the guild. Returns null if no banner
 * @property {Collection<Channel>} channels Collection of channels
 * @property {?String} icon The hash icon of the guild. Returns null if no icon
 * @property {?String} iconURL The icon URL of the guild
 * @property {String} id The ID of the guild
 * @property {Number} memberCount The total member count in the guild
 * @property {Collection<Member>} members Collection of members
 * @property {String} name The name of the guild
 * @property {Number} nsfwLevel The NSFW Level of the guild
 * @property {String} ownerID The ID of the guild owner
 * @property {Collection<Role>} roles An array of guild roles
 * @property {Shard} shard The shard where the guild is belongs
 * @property {Boolean} unavailable Whether the guild in unavailable or not
 */
class Guild extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.channels = new Collection(Channel);
        this.members = new Collection(Member);
        this.roles = new Collection(Role);
        this.shard = client.shards.get(client._guildShard[this.id]);

        if (data) {
            this._load(data);
        }
    }

    get bannerURL() {
        return this.banner ? this._client._formatImage(Endpoints.GUILD_BANNER(this.id, this.banner)) : null;
    }

    get iconURL() {
        return this.icon ? this.client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon)) : null;
    }

    /**
     * Create a guild role
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
    createRole(options) {
        return this.client.createGuildRole(this.id, options);
    }

    /**
     * Delete a guild role
     * @param {String} roleID The ID of the guild
     * @param {String} [reason] The reason which will be displayed in the audit log
     * @returns {Promise<void>}
     */
    deleteRole(roleID, reason) {
        return this.client.deleteGuildRole(this.id, roleID, reason);
    }

    /**
     * Edit a guild
     * @param {Object} options The options properties
     * @param {String} [options.afkChannelID] The ID of the AFK channel
     * @param {Number} [options.afkTimeout] The timeout of AFK in voice channels (in seconds)
     * @param {String} [options.banner] The banner of the guild. Banner image must be as base64 data URI
     * @param {Number} [options.defaultMessageNotifications] The default message notifications of the guild
     * @param {String} [options.description] The description of the guild
     * @param {String} [options.discoverySplash] The discovery splash of the guild. Discoery splash image must be as base 64 URI
     * @param {Number} [options.explicitContentFilter] The explicit content filter level of the guild
     * @param {Array<String>} [options.features] The enabled features of the guild
     * @param {String} [options.icon] The icon of the guild. Icon image must be as base64 data URI
     * @param {String} [options.name] The name of the guild
     * @param {String} [options.ownerID] The ID of the owner which wil be transferred to
     * @param {String} [options.preferredLocale] The preferred guild language
     * @param {String} [options.publicUpdatesChannelID] The ID of the channel where guild admins will receive Discord notifications
     * @param {String} [options.reason] The reason which will be displayed in the audit log
     * @param {String} [options.rulesChannelID] The ID of the rule channel
     * @param {String} [options.splash] The splash of the guild. Splash image must be as base64 data URI
     * @param {Number} [options.systemChannelFlags] The flags for the system channel
     * @param {String} [options.systemChannelID] The ID of the system channel
     * @param {Number} [options.verificationLevel] The verification level
     * @returns {Promise<Guild>}
     */
    edit(options) {
        return this.client.editGuild(this.id, options);
    }

    /**
     * Edit a guild role
     * @param {String} roleID The ID of the role
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
    editRole(roleID, options) {
        return this.client.editGuildRole(this.id, roleID, options);
    }

    _load(data) {
        this.unavailable = !!data.unavailable;
        this.ownerID = data.owner_id;
        this.icon = data.icon || null;
        this.name = data.name;
        this.memberCount = data.member_count;
        this.nsfwLevel = data.nsfw_level;

        if (data.members) {
            for (const member of data.members) {
                member.id = member.user.id;

                const mem = new Member(this, member);
                const user = mem.toUser();
                this.members.add(mem);
                this.client.users.add(user);
            }
        }

        if (data.channels) {
            for (const channelData of data.channels) {
                channelData.guild_id = this.id;
                
                const channel = Channel.from(this.client, channelData);
                channel.guild = this;
                this.client.channels.add(channel);
                this.channels.add(channel);
            }
        }

        if (data.roles) {
            for (const roleData of data.roles) {
                const role = new Role(this.client, this, roleData);
                this.roles.add(role);
            }
        }
    }
}

module.exports = Guild;