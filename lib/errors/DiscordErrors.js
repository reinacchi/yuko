"use strict";

class DiscordAPIError extends Error {
    constructor(response, json) {
        super(json.message);

        this.name = `DiscordAPIError [${json.code}]`;
        this.code = json.code;
        this.response = response;
    }
}

class DiscordError extends Error {
    constructor(message) {
        super(message);

        this.name = this.constructor?.name || "DiscordError";
    }
}

class DiscordHTTPError extends DiscordError {};

class TimeoutError extends DiscordError {};
class BadFormat extends DiscordError {};
class ConstructionError extends DiscordError {};
class InvalidToken extends DiscordError {};

module.exports = {
    BadFormat,
    ConstructionError,
    DiscordAPIError,
    DiscordError,
    DiscordHTTPError,
    InvalidToken,
    TimeoutError
}