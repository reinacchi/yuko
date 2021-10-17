"use strict";

const Channel = require("./Channel");

/**
 * Represents a DM-based channels
 * @extends {Channel}
 * @property {String} lastMessageID The ID of the last message sent in the channel
 */
class DMChannel extends Channel {
    constructor(client, data) {
        super(client, data);

        this.lastMessageID = data.last_message_id;
    }

    /**
     * Create a message
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<Object>} [content.embeds] An array of embed objects
     * @param {Object} [content.messageReference] The message reference used when replying to messages
     * @param {String} [content.messageReference.channelID] The ID of the channel where the message was referenced
     * @param {Boolean} [content.messageReference.failIfNotExists] Whether to throw an error when the message reference doesn't exist
     * @param {String} [content.messageReference.guildID] The ID of the guild where the message was referenced
     * @param {String} content.messageReference.messageID The ID of the message which was referenced
     * @param {Boolean} [content.tts] Whether to send message as Text-to-Speech (TTS)
     * @returns {Promise<Message>}
     */
    createMessage(content) {
        return this.client.createMessage.call(this.client, this.id, content);
    }

    /**
     * Delete a message
     * @param {String} messageID The ID of the message
     * @returns {Promise<void>}
     */
     deleteMessage(messageID) {
        return this.client.deleteMessage.call(this.client, this.id, messageID);
    }

    /**
     * Edit a message
     * @param {String} messageID The ID of the message
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<Object>} [content.embeds] An array of embed objects
     * @param {Number} [content.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(messageID, content) {
        return this.client.editMessage.call(this.client, this.id, messageID, content);
    }

    /**
     * Get multiple messages in this channel
     * @returns {Promise<Array<Message>>}
     */
    getMessages() {
        return this.client.getMessages.call(this.client, this.id);
    }
}

module.exports = DMChannel;