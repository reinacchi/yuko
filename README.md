# Yuko

A Discord Library Written In JavaScript.

# Installing

You'll need NodeJS 14+ installed.

```
npm install --save yuko
```

# Examples

- More examples can be found [Here](https://github.com/NotMarx/yuko/tree/master/examples).

```js
const Yuko = require("yuko");
const client = new Yuko.Client("Bot TOKEN", { intents: ["guilds", "guildMessages"]});

client.on("ready", () => {
    console.log(`${client.user.tag} is Ready!`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "!ping") {
        client.createMessage("The Channel ID", { content: "Pong!"});
    }
});

client.connect();
```

# Resources Links

- **Yuko's Official Docs** is currently **W.I.P**.
- **[Yuko's GitHub Repository](https://github.com/NotMarx/yuko)** is where the main development of the library.
- **[Yuko's Support Server](https://discord.gg/5wP5cCqSHD)** is where you can ask help within the library or contact me.

# License

**Yuko** is released under the [MIT License](https://opensource.org/licenses/MIT).