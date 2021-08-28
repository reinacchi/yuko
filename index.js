"use strict";

module.exports = {
    Channel: require("./lib/structures/Channel"),
    Client: require("./lib/client/Client"),
    ClientUser: require("./lib/structures/ClientUser"),
    Collection: require("./lib/utils/Collection"),
    DMChannel: require("./lib/structures/DMChannel"),
    Guild: require("./lib/structures/Guild"),
    GuildChannel: require("./lib/structures/GuildChannel"),
    Member: require("./lib/structures/Member"),
    Message: require("./lib/structures/Message"),
    RESTManager: require("./lib/rest/RESTManager"),
    TextChannel: require("./lib/structures/TextChannel"),
    User: require("./lib/structures/User"),
    Websocket: require("./lib/utils/Websocket"),

    VERSION: require("./package.json").version
};