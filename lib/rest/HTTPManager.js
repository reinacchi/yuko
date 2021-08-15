"use strict";

const Endpoints = require("./Endpoints");
const RESTManager = require("./RESTManager");

class HTTPManager {
    constructor(client) {
        this.client = client;
        this.rest = new RESTManager(this.client);
    } 
    
    async getConnectionInfo() {
        const route = this.rest.route("GET", Endpoints.GATEWAY_BOT);
        return await this.rest.request(route);
    }

    async getRecommendedShardCount() {
        return (await this.getConnectionInfo()).shards;
    }

    async getClientInformation() {
        return await this.rest.request(this.rest.route("GET", Endpoints.USER("@me")));
    }
}

module.exports = HTTPManager;