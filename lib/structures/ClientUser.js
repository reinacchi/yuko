"use strict";

const User = require("./User");

class ClientUser extends User {
    constructor(client, data) {
        super(client, data);
        this.loadData(data);
    }

    loadData(data) {
        super.loadData(data);
        
        this.mfaEnabled = data.mfa_enabled;
        this.locale = data.locale;
        this.verified = data.verified;
    }
}

module.exports = ClientUser;