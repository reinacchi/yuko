"use strict";

const GuildChannel = require("./GuildChannel");

/**
 * Represents a text-based channels
 * @extends {GuildChannel}
 * @property {String} lastMessageID The ID of the last message sent in the channel
 * @property {String} name The name of the channel
 * @property {Boolean} nsfw Whether the channel is NSFW or not
 * @property {String} id The ID of the channel
 * @property {?String} topic The topic of the channel 
 */
class TextChannel extends GuildChannel {
    constructor(client, data) {
        super(client, data);

        if (data) {
            this._load(data);
        }
    }

    /**
     * Create a message
     * @param {Object} options An object of options
     * @param {String} [options.content] The message options
     * @param {Array<String>} [options.embeds] An array of embed objects
     * @param {Object} [options.messageReference] The message reference used when replying to messages
     * @param {String} [options.messageReference.channelID] The ID of the channel where the message was referenced
     * @param {Boolean} [options.messageReference.failIfNotExists] Whether to throw an error when the message reference doesn't exist
     * @param {String} [options.messageReference.guildID] The ID of the guild where the message was referenced
     * @param {String} options.messageReference.messageID The ID of the message which was referenced
     * @param {Boolean} [options.tts] Whether to send message as Text-to-Speech (TTS)
     * @returns {Promise<Message>}
     */
    createMessage(options) {
        return this.client.createMessage.call(this.client, this.id, options);
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
     * @param {Object} options An object of options
     * @param {String} [options.content] The message options
     * @param {Array<Object>} [options.embeds] An array of embed objects
     * @param {Number} [options.flags] A number representing flags that will apply to the message
     * @returns {Promise<Message>}
     */
    editMessage(messageID, options) {
        return this.client.editMessage.call(this.client, this.id, messageID, options);
    }

    /**
     * Get multiple messages in this channel
     * @returns {Promise<Array<Message>>}
     */
    getMessages() {
        return this.client.getMessages.call(this.client, this.id);
    }

    _load(data) {
        this.lastMessageID = data.last_message_id;
        this.name = data.name;
        this.nsfw = !!data.nsfw;
        this.topic = data.topic;
    }
}

module.exports = TextChannel;