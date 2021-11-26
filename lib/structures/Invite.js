"use strict";

const Base = require("./Base");
const Guild = require("./Guild");
const User = require("./User");

/**
 * Represents an invite
 * @extends {Base}
 * @property {Number?} approximateMemberCount The approximate member count inside the guild
 * @property {Number?} approximatePresenceCount The approximate presence count inside the guild
 * @property {TextChannel} channel The channel of the invite
 * @property {String} code The invite code
 * @property {Number?} createdAt The timestamp of the invite creation
 * @property {Guild?} guild The guild of the invite
 * @property {User?} inviter The inviter
 * @property {Number?} maxAge The age of how long the invite will lasts (in seconds)
 * @property {Number?} maxUses The max uses of the invite
 * @property {String?} targetApplicationID The ID of the target application
 * @property {Number?} targetType The type of the target application
 * @property {User?} targetUser The user whose stream to display for this voice channel stream invite
 * @property {Number?} uses The total number of the invite uses
 */
class Invite extends Base {
    constructor(client, data) {
        super();

        this.client = client;

        if (data) {
            this._load(data);
        }
    }

    get createdAt() {
        return Date.parse(this._createdAt);
    }

    /**
     * Delete an invite
     * @param {String} reason The reason which will be displayed in the audit log
     * @returns {Promise<void>}
     */
    delete(reason) {
        return this.client.deleteInvite(this.code, reason);
    }

    _load(data) {
        this.approximateMemberCount = data.approximate_member_count || null;
        this.approximatePresenceCount = data.approximate_presence_count || null;
        this.channel = this.client.channels.get(data.channel.id);
        this.code = data.code;
        this._createdAt = data.created_at || null;
        this.maxUses = data.max_uses || null;
        this.maxAge = data.max_age || null;
        this.targetApplicationID = data.target_application.id || null;
        this.targetType = data.target_type || null;
        this.targetUser = new User(this.client, data.target_user) || null;
        this.temporary = data.temporary || null;
        this.uses = data.uses || null;

        if (data.inviter) {
            this.inviter = this.client.users.add(data.inviter);
        }

        if (data.guild) {
            this.guild = new Guild(this.client, data.guild);
        }
    }
}

module.exports = Invite;