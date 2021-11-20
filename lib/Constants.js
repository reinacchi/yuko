"use strict";

module.exports.ChannelTypes = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_NEWS: 5,
    GUILD_STORE: 6,
    GUILD_NEWS_THREAD: 10,
    GUILD_THREAD: 11,
    GUILD_PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13
};

module.exports.GatewayIntents = {
    Guilds: 1 << 0,
    GuildMembers: 1 << 1,
    GuildBans: 1 << 2,
    GuildEmojis: 1 << 3,
    GuildIntegrations: 1 << 4,
    GuildWebhooks: 1 << 5,
    GuildInvites: 1 << 6,
    GuildVoiceStates: 1 << 7,
    GuildPresences: 1 << 8,
    GuildMessages: 1 << 9,
    GuildMessageReactions: 1 << 10,
    GuildMessageTyping: 1 << 11,
    DirectMessages: 1 << 12,
    DirectMessageReactions: 1 << 13,
    DirectMessageTyping: 1 << 14
};

module.exports.GatewayIntents.AllPrivileged = this.GatewayIntents.GuildMembers | this.GatewayIntents.GuildPresences;
module.exports.GatewayIntents.AllNonPrivileged = this.GatewayIntents.Guilds | this.GatewayIntents.GuildBans | this.GatewayIntents.GuildEmojis | this.GatewayIntents.GuildIntegrations | this.GatewayIntents.GuildWebhooks | this.GatewayIntents.GuildInvites | this.GatewayIntents.GuildVoiceStates | this.GatewayIntents.GuildMessages | this.GatewayIntents.GuildMessageReactions | this.GatewayIntents.GuildMessageTyping | this.GatewayIntents.DirectMessages | this.GatewayIntents.DirectMessageReactions | this.GatewayIntents.DirectMessageTyping;
module.exports.GatewayIntents.AllGuild = this.GatewayIntents.Guilds | this.GatewayIntents.GuildMembers | this.GatewayIntents.GuildBans | this.GatewayIntents.GuildEmojis | this.GatewayIntents.GuildIntegrations | this.GatewayIntents.GuildWebhooks | this.GatewayIntents.GuildInvites | this.GatewayIntents.GuildVoiceStates | this.GatewayIntents.GuildPresences | this.GatewayIntents.GuildMessages | this.GatewayIntents.GuildMessageReactions | this.GatewayIntents.GuildMessageTyping;
module.exports.GatewayIntents.AllDM = this.GatewayIntents.DirectMessages | this.GatewayIntents.DirectMessageReactions | this.GatewayIntents.DirectMessageTyping;
module.exports.GatewayIntents.All = this.GatewayIntents.AllPrivileged | this.GatewayIntents.AllNonPrivileged;

module.exports.GatewayOPCodes = {
    EVENT: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    PRESENCE_UPDATE: 3,
    VOICE_STATE_UPDATE: 4,
    VOICE_SERVER_PING: 5,
    RESUME: 6,
    RECONNECT: 7,
    GET_GUILD_MEMBERS: 8,
    INVALID_SESSION: 9,
    HELLO: 10,
    HEARTBEAT_ACK: 11,
    SYNC_GUILD: 12,
    SYNC_CALL: 13
};

module.exports.ImageFormatTypes = [
    "gif",
    "jpeg",
    "jpg",
    "png",
    "webp"
];

module.exports.ImageSizes = {
    MAXIMUM: 4096,
    MINIMUM: 16
};

module.exports.MessageActivityFlags = {
    INSTANCE: 1 << 0,
    JOIN: 1 << 1,
    SPECTATE: 1 << 2,
    JOIN_REQUEST: 1 << 3,
    SYNC: 1 << 4,
    PLAY: 1 << 5,
    PARTY_PRIVACY_FRIENDS: 1 << 6,
    PARTY_PRIVACY_VOICE_CHANNEL: 1 << 7,
    EMBEDDED: 1 << 8
};

module.exports.MessageActivityTypes = {
    JOIN: 1,
    SPECTATE: 2,
    LISTEN: 3,
    JOIN_REQUEST: 5
};

module.exports.MessageFlags = {
    CROSSPOSTED: 1 << 0,
    IS_CROSSPOST: 1 << 1,
    SUPPRESS_EMBEDS: 1 << 2,
    SOURCE_MESSAGE_DELETED: 1 << 3,
    URGENT: 1 << 4,
    HAS_THREAD: 1 << 5,
    EPHEMERAL: 1 << 6,
    LOADING: 1 << 7
};

module.exports.MessageTypes = {
    DEFAULT: 0,
    RECIPIENT_ADD: 1,
    RECIPIENT_REMOVE: 2,
    CALL: 3,
    CHANNEL_NAME_CHANGE: 4,
    CHANNEL_ICON_CHANGE: 5,
    CHANNEL_PINNED_MESSAGE: 6,
    GUILD_MEMBER_JOIN: 7,
    USER_PREMIUM_GUILD_SUBSCRIPTION: 8,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1: 9,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2: 10,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3: 11,
    CHANNEL_FOLLOW_ADD: 12,
    GUILD_DISCOVERY_DISQUALIFIED: 14,
    GUILD_DISCOVERY_REQUALIFIED: 15,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: 16,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING: 17,
    THREAD_CREATED: 18,
    REPLY: 19,
    CHAT_INPUT_COMMAND: 20,
    THREAD_STARTER_MESSAGE: 21,
    GUILD_INVITE_REMINDER: 22,
    CONTEXT_MENU_COMMAND: 23
};


module.exports.PublicFlags = {
    DISCORD_EMPLOYEE: 1 << 0,
    PARTNERED_SERVER_OWNER: 1 << 1,
    HYPESQUAD_EVENTS: 1 << 2,
    BUG_HUNTER_LEVEL_1: 1 << 3,
    HOUSE_BRAVERY: 1 << 6,
    HOUSE_BRILLIANCE: 1 << 7,
    HOUSE_BALANCE: 1 << 8,
    EARLY_SUPPORTER: 1 << 9,
    TEAM_USER: 1 << 10,
    BUG_HUNTER_LEVEL_2: 1 << 14,
    VERIFIED_BOT: 1 << 16,
    EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
    DISCORD_CERTIFIED_MODERATOR: 1 << 18
};

module.exports.Permissions = {
    CreateInstantsInvite: 1n << 0n,
    KickMembers: 1n << 1n,
    BanMembers: 1n << 2n,
    Administrator: 1n << 3n,
    ManageChannels: 1n << 4n,
    ManageGuild: 1n << 5n,
    AddReactions: 1n << 6n,
    ViewAuditLog: 1n << 7n,
    VoicePrioritySpeaker: 1n << 8n,
    VoiceStream: 1n << 9n,
    ViewChannel: 1n << 10n,
    SendMessages: 1n << 11n,
    SendTTSMessages: 1n << 12n,
    ManageMessages: 1n << 13n,
    EmbedLinks: 1n << 14n,
    AttachFiles: 1n << 15n,
    ReadMessageHistory: 1n << 16n,
    MentionEveryone: 1n << 17n,
    UseExternalEmojis: 1n << 18n,
    ViewGuildInsights: 1n << 19n,
    VoiceConnect: 1n << 20n,
    VoiceSpeak: 1n << 21n,
    VoiceMuteMembers: 1n << 22n,
    VoiceDeafenMembers: 1n << 23n,
    VoiceMoveMembers: 1n << 24n,
    VoiceUseVAD: 1n << 25n,
    ChangeNickname: 1n << 26n,
    ManageNicknames: 1n << 27n,
    ManageRoles: 1n << 28n,
    ManageWebhooks: 1n << 29n,
    ManageEmojisAndStickers: 1n << 30n,
    UseApplicationCommands: 1n << 31n,
    VoiceRequestToSpeak: 1n << 32n,
    ManageEvents: 1n << 33n,
    ManageThreads: 1n << 34n,
    CreatePublicThreads: 1n << 35n,
    CreatePrivateThreads: 1n << 36n,
    UseExternalStickers: 1n << 37n,
    SendMessagesInThreads: 1n << 38n,
    StartEmbeddedActivities: 1n << 39n
};

module.exports.Permissions.AllGuild = this.Permissions.KickMembers | this.Permissions.BanMembers | this.Permissions.Administrator | this.Permissions.ManageChannels | this.Permissions.ManageGuild | this.Permissions.ViewAuditLog | this.Permissions.ViewGuildInsights | this.Permissions.ChangeNickname | this.Permissions.ManageNicknames | this.Permissions.ManageRoles | this.Permissions.ManageWebhooks | this.Permissions.ManageEmojisAndStickers;
module.exports.Permissions.AllGuildText = this.Permissions.CreateInstantsInvite | this.Permissions.ManageChannels | this.Permissions.AddReactions | this.Permissions.ViewChannel | this.Permissions.SendMessages | this.Permissions.SendTTSMessages | this.Permissions.ManageMessages | this.Permissions.EmbedLinks | this.Permissions.AttachFiles | this.Permissions.ReadMessageHistory | this.Permissions.MentionEveryone | this.Permissions.UseExternalEmojis | this.Permissions.ManageRoles | this.Permissions.ManageWebhooks | this.Permissions.UseApplicationCommands | this.Permissions.CreatePublicThreads | this.Permissions.CreatePrivateThreads | this.Permissions.UseExternalStickers | this.Permissions.SendMessagesInThreads;
module.exports.Permissions.AllGuildVoice = this.Permissions.CreateInstantsInvite | this.Permissions.ManageChannels | this.Permissions.VoicePrioritySpeaker | this.Permissions.VoiceStream | this.Permissions.ViewChannel | this.Permissions.VoiceConnect | this.Permissions.VoiceSpeak | this.Permissions.VoiceMuteMembers | this.Permissions.VoiceDeafenMembers | this.Permissions.VoiceMoveMembers | this.Permissions.VoiceUseVAD | this.Permissions.ManageRoles | this.Permissions.VoiceRequestToSpeak | this.Permissions.StartEmbeddedActivities;
module.exports.Permissions.All = this.Permissions.AllGuild | this.Permissions.AllGuildText | this.Permissions.AllGuildVoice;

module.exports.PremiumTypes = {
    NITRO_CLASSIC: 1,
    NITRO: 2
};

module.exports.WebsocketState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSE: 3
};

// Versions
module.exports.API_VERSION = 9;
module.exports.GATEWAY_VERSION = 9;