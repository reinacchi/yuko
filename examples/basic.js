const Yuko = require("yuko");
const client = new Yuko.Client("TOKEN", { intents: ["Guilds", "GuildMessages"] });

client.on("gatewayReady", () => {
    console.log(`${client.user.username} is Ready!`);
});

client.on("error", (err) => {
    console.log(err);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content === "!ping") {
        message.channel.createMessage({ content: "Pong!" });
    } else if (message.content === "!embed") {
        message.channel.createMessage({
            embed: {
                title: "This is the title of the embed",
                description: "Some cool description I can add to tell!",
                color: 0x42B893
            }
        });
    } else if (message.content === "!reply") {
        message.channel.createMessage({ content: "Replied to your message!", messageReference: { messageID: message.id } });
    }
});

client.connect();