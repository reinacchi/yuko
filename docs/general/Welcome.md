<div align="center"><h1>Yuko</h1></div>
<div align="center"><h3>Yuko Official Documentation</h3></div>

<br>

# What is Yuko?

[![Yuko Status](https://img.shields.io/badge/status-unstable-blue)](https://github.com/reinhello/yuko)
[![Yuko Release](https://img.shields.io/github/v/release/reinhello/yuko?color=%2342B893&logoColor=black)](https://github.com/reinhello/yuko/releases/latest)
[![Discord Server](https://discord.com/api/guilds/874558291349491712/widget.png?style=shield)](https://discord.gg/5wP5cCqSHD)

**Yuko** is a Discord library written in JavaScript to interact with the [Discord API](https://discord.com/developers/docs/intro).

# Creating a Discord bot

Before using the library, you will need to create a Discord bot and get its token to run the bot. You can create a Discord bot by login via [Discord Developer Portal](https://discord.com/developers/applications) and click on the **New Application**. Once an application was created, go to the **Bot** section and create a new bot. Then, copy the token and use it to connect the bot to the Discord gateway.

# Installation Requirements

- **[NodeJS 14+](https://nodejs.org/en/download/)** 
- **IDE** ([Visual Studio Code](https://code.visualstudio.com/download), [Sublime](https://www.sublimetext.com/3))

# Installing Yuko

To install the library, create a folder for your Discord bot project somewhere accessible and use **NPM** to install Yuko.

```
npm install yuko
```

Or if you want the most latest version:

```
npm install NotMarx/yuko#master
```

# Example Discord Bot

After a folder was created for your bot, use `npm init -y` to initalize a NodeJS project and create a `index.js` file and copy the following code below to your file.

- **Hint:** More examples can be found [Here](https://github.com/reinhello/yuko/tree/master/examples).

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

After copying and replaced `TOKEN` with your bot real token, run `node index.js` in the same directory.