import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import path from "../scripts/path.js";
import Command from "./Command.js";
import Mention from "./Mention.js";

export default class Bot {
  #commands;
  #mentions;

  constructor(name) {
    this.name = name;
    this.client = Bot.client();

    this.#commands = [];
    this.#mentions = [
      new Mention({
        name: "everyone",
        aliases: ["everybody", "all", "semua", "semuaorang"],
        handler: () => true,
      }),
      new Mention({
        name: "admin",
        handler: (participant) => participant.isAdmin,
      }),
      new Mention({
        name: "member",
        handler: (participant) =>
          !(participant.isAdmin || participant.isSuperAdmin),
      }),
    ];

    this.initialize();
  }

  async handleMessage(msg) {
    const command = Command.findByMessage(this.#commands, msg.body);
    const mention = Mention.findByMessage(this.#mentions, msg.body);

    if (!command && !mention) return;

    const chat = await msg.getChat();

    this.log(`Message from ${chat.name} (${chat.id._serialized})\n${msg.body}`);

    if (command) {
      if (command.isRunnable(chat)) command.run({ msg });
      else {
        const errorMessage = `Command \`\`\`${Command.PREFIX}${command.prompt}\`\`\` isn't available here.`;
        msg.reply(errorMessage);
        this.error(errorMessage);
      }
    }

    if (mention) {
      if (mention.isRunnable(chat)) {
        const participants = await chat.participants;
        const mentions = await mention.run(participants, this.client);

        const options = { mentions };
        if (msg.hasMedia) options.media = await msg.downloadMedia();

        if (msg.hasQuotedMsg) {
          const quotedMsg = await msg.getQuotedMessage();
          quotedMsg.reply(msg.body, msg.from, options);
        } else {
          chat.sendMessage(msg.body, options);
        }
      } else {
        const errorMessage = `Mention \`\`\`@${mention.name}\`\`\` isn't available here.`;
        msg.reply(errorMessage);
        this.error(errorMessage);
      }
    }
  }

  addCommand(command) {
    this.#commands.push(command);
  }

  addMention(mention) {
    this.#mentions.push(mention);
  }

  on(eventType, callback) {
    this.client.on(eventType, callback);
  }

  initialize() {
    this.on("message", this.handleMessage.bind(this));
    this.on("loading_screen", (percent, message) => {
      this.log("LOADING SCREEN", percent, message);
    });
    this.on("qr", (qr) => {
      this.log("QR RECEIVED", qr);
      qrcode.generate(qr, { small: true });
    });
    this.on("authenticated", () => {
      this.log("AUTHENTICATED");
    });
    this.on("auth_failure", (msg) => {
      this.error(`AUTHENTICATION FAILURE: ${msg}`);
    });
    this.on("ready", () => {
      this.log("READY");
    });
    this.on("message_revoke_everyone", async (after, before) => {
      if (!before) return;
      if (before.fromMe) return;

      const contact = await before.getContact();
      after.reply(`Pesan terhapus dari\n*${contact.pushname}*\n${before.body}`);
      this.log(`Pesan terhapus dari\n*${contact.pushname}*\n${before.body}`);
    });

    this.client.initialize();
  }

  sendMessage(chatId, msg, options = {}) {
    this.client.sendMessage(chatId, msg, options);
    this.log(`Mengirim pesan kepada *${chatId}*`);
    this.log(msg, options);
  }

  log(...msg) {
    console.log(`${this.name}:`, ...msg);
  }

  error(e) {
    console.error(`${this.name}: Error:`, e);
  }

  static client() {
    return new Client({
      puppeteer: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
        headless: true,
      },
      authStrategy: new LocalAuth({ dataPath: path.root() }),
    });
  }
}
