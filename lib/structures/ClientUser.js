"use strict";

const { GatewayOPCodes } = require("../Constants");
const User = require("./User");

/**
 * An extended class of User
 * @extends {User}
 * @property {String} locale The user's chosen language option
 * @property {Boolean} mfaEnabled Whether the user has 2FA enabled or not
 * @property {Boolean} verified Whether the user is verified or not
 */
class ClientUser extends User {
    constructor(client, data) {
        super(client, data);

        this._load(data);
    }

    /**
     * Update the bot's status
     * @param {String} status The bot's status; either "online", "idle", "dnd", or "invisible"
     * @param {Object} [activity] The bot's activity; null to clear
     * @param {String} [activity.name] The activity's name
     * @param {Number} [activity.type] The activity's type
     * @param {String} [activity.url] The stream URL. Currently supports YouTube and Twitch only
     */
    editStatus(status, activity) {
        this.client.shards.forEach((shard) => {
            shard.send(JSON.stringify({
                op: GatewayOPCodes.PRESENCE_UPDATE,
                d: {
                    game: {
                        name: activity ? activity.name : null,
                        type: activity ? activity.type : 0,
                        url: activity ? activity.url : null
                    },
                    status: status || "online",
                    since: Date.now(),
                    afk: false
                }
            }));
        });
    }

    _load(data) {
        super._load(data);
        
        this.mfaEnabled = data.mfa_enabled;
        this.locale = data.locale;
        this.verified = data.verified;
    }
}

module.exports = ClientUser;