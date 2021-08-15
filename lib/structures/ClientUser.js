"use strict";

const User = require("./User");

/**
 * An extended class of {@link User}
 */
class ClientUser extends User {
    constructor(client, data) {
        super(client, data);

        this.load(data);
    }

    load(data) {
        super.load(data);
        
        this.mfaEnabled = data.mfa_enabled;
        this.locale = data.locale;
        this.verified = data.verified;
    }
}

module.exports = ClientUser;