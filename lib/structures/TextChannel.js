"use strict";

const GuildChannel = require("./GuildChannel");

/**
 * Represents a text-based channels
 */
class TextChannel extends GuildChannel {
    constructor(client, data) {
        super(client, data);

        if (data) this._load(data);
    }

    _load(data) {
        this.lastMessageID = data.last_message_id;
        this.name = data.name
        this.nsfw = data.nsfw;
        this.topic = data.topic;
    }

    /**
     * Create a message
     * @param {String} channelID The ID of the channel
     * @param {Object} content An object of content
     * @param {String} [content.content] The message content
     * @param {Array<String>} [content.embeds] An array of embed objects
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
}

module.exports = TextChannel;