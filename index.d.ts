import { EventEmitter } from "events";

/**
 * A Discord Library Written In JavaScript
 */
declare module "yuko";

type ContentType = string | "application/json"
type HTTPMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
type IntentOptions = "guilds" | "guildMembers" | "guildBans" | "guildEmojis" | "guildIntegrations" | "guildWebhooks" | "guildInvites" | "guildVoiceStates" | "guildPresences" | "guildMessages" | "guildMessageReactions" | "guildMessageTyping" | "directMessages" | "directMessageReactions" | "directMessageTyping";
interface ClientEvents {
    ready: [];
    messageCreate: [message: Message];
}

interface ClientOptions {
    intents: IntentOptions[];
    shard?: boolean;
    shardCount?: number | "auto";
}

interface EmbedAuthorOptions {
    icon_url?: string;
    name: string;
    url?: string;
}

interface EmbedFieldOptions {
    inline?: boolean;
    name: string;
    value: string;
}

interface EmbedFooterOptions {
    icon_url?: string;
    text?: string;
}

interface EmbedImageOptions {
    url?: string;
}

interface EmbedOptions {
    author?: EmbedAuthorOptions;
    color?: number;
    description?: string;
    fields: EmbedFieldOptions[];
    footer?: EmbedFooterOptions;
    image?: EmbedImageOptions;
    thumbnail?: EmbedImageOptions;
    timestamps?: string | Date;
    title?: string;
    url?: string;
}

interface MessageOptions {
    content?: string;
    embeds?: EmbedOptions[];
    flags?: number;
    messageReference?: MessageReferenceOptions;
    tts?: boolean;
}

interface MessageReferenceOptions {
    channelID?: string;
    failIfNotExists?: boolean;
    guildID?: string;
    messageID: string;
}

class Base {
    constructor(id: string);

    createdAt: number;
    id: string;
    getCreatedAt(id: string): number;
    toJSON(props: string[]): { id: string, createdAt: number };
    toString(): string;
}

export class Client extends EventEmitter {
    constructor(token: string, options?: ClientOptions);

    connected: boolean;
    isSharded: boolean;
    latencies: number[];
    latency: number;
    rest: RESTManager;
    shards: any[];
    token: string;
    user: ClientUser;
    connect(): Promise<void>;
    createMessage(channelID: string, content: MessageOptions): Promise<Message>;
    editMessage(channelID: string, messageID: string, content: MessageOptions): Promise<Message>;
    on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    on<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => void,
    ): this;
    once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    once<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => void,
    ): this;
    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean;
    off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    off<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => void,
    ): this;
    removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
    removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this;
}

export class ClientUser extends User {
    constructor(client: Client, data: object);

    locale: string;
    mfaEnabled: boolean;
    verified: boolean;
    private loadData(data: object): Promise<void>;
}

export class Message extends Base {
    constructor(client: Client, data: object);

    author: User;
    channelID: string;
    content: string;
    embeds: object[];
    id: string;
    pinned: boolean;
    tts: boolean;
    type: number;
    edit(content: MessageOptions): Promise<Message>;
}

export class User extends Base {
    constructor(client: Client, data: object);
    
    bot: boolean;
    client: Client;
    discriminator: string;
    id: string;
    system: boolean;
    tag: string;
    toString: string;
    rawData: object;
    username: string;
    private loadData(data: object): Promise<void>;

}

export class RESTManager {
    constructor(client: Client);

    request(route: Route, payload?: unknown, contentType: ContentType): Promise<unknown>;
    route(method: HTTPMethod, route: string);
}

class Route {
    constructor(method: HTTPMethod, route: string);

    url: string;
}