<div align="center"><h1>Yuko</h1></div>
<div align="center"><h3>Yuko Official Documentation</h3></div>

<br>

# What is Yuko?

**Yuko** is a Discord library written in JavaScript to interact with the [Discord API](https://discord.com/developers/docs/intro) easily.

# Creating a Discord bot

Before using the library, you'll need to create a Discord bot and get the token to run the bot. You can create a Discord bot by login via [Discord Developer Portal](https://discord.com/developers/applications) and click on the **New Application**. Once an application was created, go to **Bot** section and create a new bot. Then, copy the token and use it to connect the bot.

# Installation Requirements

- [NodeJS 14+](https://nodejs.org/en/download/) 
- Code editor

# Installing Yuko

To install the library, create a folder for your Discord bot project somewhere and use NPM to install Yuko.

```
npm install yuko
```

**OR**

```
npm install NotMarx/yuko#master
```

# Example Discord Bot

Once you created a folder for your bot, use `npm init -y` to initalize a NodeJS project and create a `index.js` file and copy the following code below to your file.

- **Hint:** More examples can be found [Here](https://github.com/NotMarx/yuko/tree/master/examples).

```js
const Yuko = require("yuko");
const client = new Yuko.Client("TOKEN", { intents: ["Guilds", "GuildMessages"] });

client.on("gatewayReady", () => {
    console.log(`${client.user.username} is Ready!`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        message.channel.createMessage({ content: "Pong!" });
    }
});

client.connect();
```

After copying and replaced `TOKEN` with your bot real token, run `node index.js` in the same folder.