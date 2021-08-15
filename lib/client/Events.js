"use strict";

const ClientUser = require("../structures/ClientUser");
const Message = require("../structures/Message");

const WHITELISTED_EVENTS = [
    "READY", 
    "RESUMED",
    "GUILD_CREATE", 
    "GUILD_DELETE",
    "GUILD_MEMBER_ADD", 
    "GUILD_MEMBER_REMOVE",
    "GUILD_MEMBERS_CHUNK"
];

module.exports = async function emitEvent(client, ws, event, data) {
    event = event.toUpperCase().replace(" ", "_");

    if (!client.connected && !WHITELISTED_EVENTS.includes(event)) return;

    switch(event) {
        case "READY": {
            ws.sessionID = data.session_id;

            if (!ws.shardID) {
                client.connected = true;
                client.user = new ClientUser(client, data.user);
                client.startupTimestamp = parseFloat(process.hrtime().join("."));
                await client.emit("ready");
            }
            
            if (client.isSharded) {
                await client.emit("shardPreReady", ws.shardID);
            }
            break;
        }
        case "MESSAGE_CREATE": {
            const message = new Message(client, data);
            client.messages.push(message);
            await client.emit("messageCreate", message);
        }
    }
}