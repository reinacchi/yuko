"use strict";

const Channel = require("./Channel");
const Constants = require("../Constants");
const User = require("./User");

/**
 * Represents a DM-based channels
 * @extends {Channel}
 * @property {String} lastMessageID The ID of the last message sent in the channel
 * @property {User} recipient The recipient in the DM channel
 */
class DMChannel extends Channel {
    constructor(client, data) {
        super(client, data);

        this.lastMessageID = data.last_message_id;

        if (this.type === Constants.ChannelTypes.DM) {
            this.recipient = new User(this.client, data.recipients[0]);
        }
    }

    /**
     * Add a reaction to a message
     * @param {String} messageID The ID of the message
     * @param {String} reaction The reaction. `name:id` for custom emoji
     * @returns {Promise<void>}
     */
    addMessageReaction(messageID, reaction) {
        return this.client.addMessageReaction(this.id, messageID, reaction);
    }

    /**
     * Create a message
     * @param {Object} options The message options
     * @param {String} [options.content] The message options
     * @param {Object} [options.embed] An embed objects. Use `options.embeds` to send multiple embeds
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Object} [options.messageReference] The message reference used when replying to messages
     * @param {String} [options.messageReference.channelID] The ID of the channel where the message was referenced
     * @param {Boolean} [options.messageReference.failIfNotExists] Whether to throw an error when the message reference doesn't exist
     * @param {String} [options.messageReference.guildID] The ID of the guild where the message was referenced
     * @param {String} options.messageReference.messageID The ID of the message which was referenced
     * @param {Boolean} [options.tts] Whether to send message as Text-to-Speech (TTS)
     * @returns {Promise<Message>}
     */
    createMessage(options) {
        return this.client.createMessage(this.id, options);
    }

    /**
     * Delete a message
     * @param {String} messageID The ID of the message
     * @returns {Promise<void>}
     */
    deleteMessage(messageID) {
        return this.client.deleteMessage(this.id, messageID);
    }

    /**
     * Edit a message
     * @param {String} messageID The ID of the message
     * @param {Object} options The message options
     * @param {String} [options.content] The message options
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Number} [options.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(messageID, options) {
        return this.client.editMessage(this.id, messageID, options);
    }

    /**
     * Get multiple messages in this channel
     * @returns {Promise<Array<Message>>}
     */
    getMessages() {
        return this.client.getMessages(this.id);
    }

    /**
     * Remove a reaction from a message
     * @param {String} messageID The ID of the message
     * @param {String} reaction The reaction. `name:id` if custom emoji
     * @param {String} [userID="@me"] The ID of the user of the reaction
     * @returns {Promise<void>}
     */
    removeMessageReaction(messageID, reaction, userID) {
        return this.client.removeMessageReaction(this.id, messageID, reaction, userID || "@me");
    }
}

module.exports = DMChannel;