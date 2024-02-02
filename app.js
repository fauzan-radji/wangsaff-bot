import "dotenv/config.js";
import Bot from "./class/Bot.js";
import Command from "./class/Command.js";
import { Contact, Group } from "./models/index.js";

const bot = new Bot(process.env.BOT_NAME);

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

bot.addCommand(
  new Command({
    prompt: "refreshdata",
    beta: true,
    handler: async ({ msg }) => {
      // save all contacts to database
      const contacts = await bot.client.getContacts();
      Contact.clear();
      contacts.forEach((contact) => {
        if (!contact.isMyContact || contact.isMe || contact.isGroup) return;
        Contact.create({
          name: contact.pushname || contact.name,
          number: contact.number,
          chat_id: contact.id._serialized,
        });
      });

      // save all groups to database
      const chats = await bot.client.getChats();
      Group.clear();
      chats.forEach((chat) => {
        if (!chat.isGroup) return;

        Group.create({
          chat_id: chat.id._serialized,
          name: chat.name,
          description: chat.description,
        });
      });

      msg.reply("Data refreshed");
    },
  })
);

bot.addCommand(
  new Command({
    prompt: "group",
    params: ["id"],
    beta: true,
    handler: async ({ msg, args: { id } }) => {
      const group = Group.find(+id);
      msg.reply(JSON.stringify(group, null, 2));
    },
  })
);

bot.addCommand(
  new Command({
    prompt: "sticker",
    aliases: ["s"],
    params: ["stickerName?"],
    beta: true,
    handler: async ({ msg, args: { stickerName = "" } }) => {
      if (!msg.hasMedia) {
        msg.reply("Please send an image");
        return;
      }

      const options = {
        media: await msg.downloadMedia(),
        sendMediaAsSticker: true,
        stickerName: stickerName,
        stickerAuthor: bot.name,
        quotedMessageId: msg.id._serialized,
      };

      bot.sendMessage(msg.from, stickerName, options);
    },
  })
);
