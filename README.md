# Yuko

[![YukoVersion](https://img.shields.io/npm/v/yuko?color=42B893&label=NPM&logo=Yuko&style=flat-square)](https://npmjs.com/package/yuko)

**Yuko** is a Discord library written in JavaScript. Both Discord's REST and Gateway are provided through this single library.

# Installation

You'll need NodeJS 14+ installed.

```
npm install --save yuko
```

# Examples

- More examples can be found [Here](https://github.com/NotMarx/yuko/tree/master/examples).

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

# Resources Links

- **[Yuko's Official Docs](https://yuko.js.org)** is where you can explore more about the library.
- **[Yuko's GitHub Repository](https://github.com/NotMarx/yuko)** is where the main development of the library happens.
   - **Yuko** official third-party library, **[Yukora](https://github.com/NotMarx/yukora)**
- **[Yuko's Support Server](https://discord.gg/5wP5cCqSHD)** is where you can ask help within the library or to contact me.

# License

**Yuko** is released under the [MIT License](https://github.com/NotMarx/yuko/blob/master/LICENSE).