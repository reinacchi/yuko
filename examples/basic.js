const Yuko = require("yuko");
const client = new Yuko.Client("Bot TOKEN");

client.on("ready", () => {
    console.log(`${client.user.username} is Ready!`);
});

// "messageCreate" event is coming soon!

client.connect();