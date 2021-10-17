"use strict";

const Endpoints = require("./Endpoints");
const RESTManager = require("./RESTManager");

class HTTPManager {
    constructor(client) {
        this.client = client;
        this.rest = new RESTManager(this.client);
    }
    
    async getClientInformation() {
        return await this.rest.request(this.rest.route("GET", Endpoints.USER("@me")));
    }
    
    async getConnectionInfo() {
        return await this.rest.request(this.rest.route("GET", Endpoints.GATEWAY_BOT));
    }

    async getDefaultShardCount() {
        return (await this.getConnectionInfo()).shards;
    }
}

module.exports = HTTPManager;