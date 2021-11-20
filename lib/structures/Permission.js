"use strict";

const Base = require("./Base");
const Constants = require("../Constants");

/**
 * Represents a permissions
 * @extends {Base}
 * @property {BigInt} allow The allowed permissions
 * @property {BigInt} [deny=0] The denied permissions
 */
class Permission extends Base {
    constructor(allow, deny = 0) {
        super();

        this.allow = BigInt(allow);
        this.deny = BigInt(deny);
    }

    /**
     * Check if guild member has this permission
     * @param {String} permission The permission name
     * @returns {Boolean}
     */
    has(permission) {
        return !!(this.allow && Constants.Permissions[permission]);
    }
}

module.exports = Permission;