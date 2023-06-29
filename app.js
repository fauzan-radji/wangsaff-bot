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
    beta: true,
  })
);

bot.addCommand(
  new Command({
    prompt: "broadcast",
    handler: async ({ msg, chat, contact: sender }) => {
      const options = {};
      if (msg.hasMedia) options.media = await msg.downloadMedia();

      for (const participant of chat.participants) {
        if (participant.id.user === sender.number) continue;

        bot.sendMessage(participant.id._serialized, `Dari ${sender.pushname}`);
        bot.sendMessage(
          participant.id._serialized,
          msg.body.slice("broadcast".length + 2),
          options
        );
      }
    },
    beta: true,
  })
);
