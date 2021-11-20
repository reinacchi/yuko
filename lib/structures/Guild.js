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
 */
class Guild extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.channels = new Collection(Channel);
        this.members = new Collection(Member);
        this.roles = new Collection(Role);

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

    _load(data) {
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