const Yuko = require("yuko");
const client = new Yuko.Client("Bot TOKEN", { intents: ["guilds", "guildMessages"]});

client.on("ready", () => {
    console.log(`${client.user.username} is Ready!`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        client.createMessage("The Channel ID", { content: "Pong!"});
    }
});

client.connect();