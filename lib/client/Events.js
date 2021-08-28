"use strict";

const ClientUser = require("../structures/ClientUser");
const Guild = require("../structures/Guild");
const Message = require("../structures/Message");

const WHITELISTED_EVENTS = [
    "READY", 
    "GUILD_CREATE",
    "MESSAGE_CREATE"
];

module.exports = async function emitEvent(client, ws, event, data) {
    event = event.toUpperCase().replace(" ", "_");

    if (!client.connected && !WHITELISTED_EVENTS.includes(event)) return;

    switch (event) {
        case "READY": {
            ws.sessionID = data.session_id;

            if (client.isSharded) {
                await client.emit("shardPreReady", ws.shardID);
            }

            if (!ws.shardID) {
                client.connected = true;
                client.user = new ClientUser(client, data.user);
                client.startupTimestamp = parseFloat(process.hrtime().join("."));
                await client.emit("ready");
            }

            break;
        }
        case "MESSAGE_CREATE": {
            const message = new Message(client, data);
            client.messages.add(message);
            await client.emit("messageCreate", message);

            break;
        }
        case "GUILD_CREATE": {
            const unavailable = data.unavailable;
            if (unavailable) return;

            const guild = new Guild(client, data);
            client.guilds.add(guild);

            if (unavailable === false) {
                await client.emit("guildAvailable", guild);
            } else {
                await client.emit("guildCreate", guild);
            }
        }
    }
}