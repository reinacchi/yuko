# Yuko

[![Yuko Status](https://img.shields.io/badge/status-unstable-blue)](https://github.com/reinhello/yuko)
[![Yuko Release](https://img.shields.io/github/v/release/reinhello/yuko?color=%2342B893&logoColor=black)](https://github.com/reinhello/yuko/releases/latest)
[![Discord Server](https://discord.com/api/guilds/874558291349491712/widget.png?style=shield)](https://discord.gg/5wP5cCqSHD)

**Yuko** is a Discord library written in JavaScript to interact with the [Discord API](https://discord.com/developers/docs/intro).

## Library Status

This library is currently under heavy development and we aware the usage of this library that you may experience unknown bugs at most common rates. 

- **Please do not report any issues until version 0.2 or until the library is completely stable.**

## Installation

You will need [NodeJS v14+](https://nodejs.org) to install this library.

```
npm install yuko
```

## Examples

- More examples can be found [Here](https://github.com/reinhello/yuko/tree/master/examples).

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

## Contributing

You can help the development of Yuko by doing main two things, which are reporting an issue or submitting a pull request to fix or improve the library.

There is a [Contributing Guideline](https://github.com/reinhello/yuko/blob/master/.github/CONTRIBUTING.md) provided which you can refer and it should ease you into the development process.

## Resources Links

- **[Yuko's Official Docs](https://yuko.js.org)** is where you can explore more about the library.
- **[Yuko's GitHub Repository](https://github.com/reinhello/yuko)** is where the main development of the library happens.
   - **Yuko** official third-party library, **[Yukora](https://github.com/reinhello/yukora)**
- **[Yuko's Support Server](https://discord.gg/5wP5cCqSHD)** is where you can ask help within the library or to contact me.

## License

**Yuko** is released under [MIT License](https://opensource.org/licenses/MIT). Please refer to the [license file](https://github.com/reinhello/yuko/blob/master/LICENSE).
