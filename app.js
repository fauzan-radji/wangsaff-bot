import Bot from "./class/Bot.js";
import Command from "./class/Command.js";

const bot = new Bot("bot");
bot.addCommand(
  new Command({
    prompt: "ping",
    handler: ({ msg }) => {
      msg.reply("pong");
    },
    beta: true,
  })
);
