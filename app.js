import "dotenv/config.js";
import Bot from "./class/Bot.js";
import Command from "./class/Command.js";

const bot = new Bot("bot");
bot.addCommand(
  new Command({
    prompt: "ping",
    aliases: ["p"],
    handler: ({ msg }) => {
      msg.reply("pong");
    },
  })
);

bot.addCommand(
  new Command({
    prompt: "broadcast",
    params: ["...message"],
    handler: async ({ args: { message }, msg, chat, contact: sender }) => {
      const options = {};
      if (msg.hasMedia) options.media = await msg.downloadMedia();

      for (const participant of chat.participants) {
        if (
          participant.id.user === bot.phoneNumber ||
          participant.id.user === sender.number
        )
          continue;

        bot.sendMessage(participant.id._serialized, `Dari ${sender.pushname}`);
        bot.sendMessage(participant.id._serialized, message, options);
      }
    },
  })
);
