"use strict";

module.exports = {
    Channel: require("./lib/structures/Channel"),
    Client: require("./lib/Client"),
    ClientUser: require("./lib/structures/ClientUser"),
    Collection: require("./lib/utils/Collection"),
    Constants: require("./lib/Constants"),
    DMChannel: require("./lib/structures/DMChannel"),
    Guild: require("./lib/structures/Guild"),
    GuildChannel: require("./lib/structures/GuildChannel"),
    Invite: require("./lib/structures/Invite"),
    Member: require("./lib/structures/Member"),
    Message: require("./lib/structures/Message"),
    Permission: require("./lib/structures/Permission"),
    RESTManager: require("./lib/managers/RESTManager"),
    Role: require("./lib/structures/Role"),
    Shard: require("./lib/core/Shard"),
    TextChannel: require("./lib/structures/TextChannel"),
    User: require("./lib/structures/User"),

    VERSION: require("./package.json").version
};