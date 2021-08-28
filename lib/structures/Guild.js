"use strict";

const Base = require("./Base");
const Channel = require("./Channel");
const Collection = require("../utils/Collection");
const GuildChannel = require("./GuildChannel");
const Member = require("./Member");
const TextChannel = require("./TextChannel");

/**
 * Represents a guild
 */
class Guild extends Base {
    constructor(client, data) {
        super(data.id);

        this.client = client;
        this.channels = new Collection();
        this.members = new Collection();

        if (data) this._load(data);
    }

    _load(data) {
        this.icon = data.icon;
        this.name = data.name;
        this.memberCount = data.member_count;
        this.nsfwLevel = data.nsfw_level;
        this.region = data.region;

        if (data.members) {
            for (const member of data.members) {
                member.id = member.user.id;
                this.members.add(member);

                let mem = new Member(this.client, this, member);
                let user = mem.toUser();
                this.client.users.add(user);
            }
        }

        if (data.channels) {
            for (const channelData of data.channels) {
                channelData.guild_id = this.id;
                
                const channel = Channel.from(this.client, channelData);
                channel.guild = this;
                this.client.channels.add(channel);
                this.channels.add(channel);
            }
        }

        /* if (data.channels) this.channels = data.channels.map((channel) => {
            if (!channel) return;

            if ([ChannelTypes.GUILD_TEXT, ChannelTypes.GUILD_NEWS].includes(channel.type)) {
                channel = new TextChannel(this.client, channel);
            } else {
                channel = new GuildChannel(this.client, channel);
            }

            this.client.channels.add(channel);
            return channel;
        }); */
    }
}

module.exports = Guild;