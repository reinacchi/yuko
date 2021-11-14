const Yuko = require("yuko");
const client = new Yuko.Client("TOKEN", { intents: ["Guilds", "GuildMessages"] });

client.on("ready", () => {
    console.log(`${client.user.username} is Ready!`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        client.createMessage(message.channelID, { content: "Pong!"});
    } else if (message.content === "!embed") {
        client.createMessage(message.channelID, {
            embeds: [
                {
                    title: "This is the title of the embed",
                    description: "Some cool description I can add to tell!",
                    color: 0x42B893
                }
            ]
        });
    } else if (message.content === "!reply") {
        client.createMessage(message.channelID, { content: "Replied to your message!", messageReference: { messageID: message.id } });
    }
});

client.connect();