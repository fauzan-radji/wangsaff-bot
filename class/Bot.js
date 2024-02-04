import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import path from "../scripts/path.js";
import Command from "./Command.js";
import Mention from "./Mention.js";
import utils from "../scripts/utils.js";
import Group from "../models/Group.js";
import Contact from "../models/Contact.js";

export default class Bot {
  #commands;
  #mentions;
  #client;
  #phoneNumber;

  constructor(name) {
    this.name = name;
    this.#client = Bot.client();

    this.#commands = [
      new Command({
        prompt: "menu",
        aliases: ["help", "bantuan"],
        handler: ({ msg, chat }) => {
          msg.reply(`*Menu*\n${this.getMenu(chat)}`);
        },
      }),
    ];
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
    if (msg.isStatus) return;

    const command = Command.findByMessage(this.#commands, msg.body);
    const mention = Mention.findByMessage(this.#mentions, msg.body);

    const chat = await msg.getChat();
    this.#addChatIfNotExists(chat);

    if (!command && !mention) return;

    const contact = await msg.getContact();

    this.log(`Message from ${chat.name} (${chat.id._serialized})\n${msg.body}`);

    /* ===========[ Run Command ]=========== */
    if (command) {
      if (command.isRunnable(chat))
        command.run(msg.body, { msg, chat, contact });
      else {
        const errorMessage = `Command \`\`\`${command.prompt}\`\`\` isn't available here.`;
        msg.reply(errorMessage);
        this.error(errorMessage);
      }
    }

    /* ===========[ Run Mention ]=========== */
    if (mention) {
      if (mention.isRunnable(chat)) {
        const participants = await chat.participants;
        const sender = msg.getContact();
        const mentions = await mention.run(participants, this, sender);

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

  #addChatIfNotExists(chat) {
    if (chat.isGroup) {
      const group = Group.findBy("chat_id", chat.id._serialized);
      if (!group) {
        Group.create({
          chat_id: chat.id._serialized,
          name: chat.name,
          description: chat.description,
        });
      }
    } else {
      const contact = Contact.findBy("chat_id", chat.id._serialized);
      if (!contact) {
        Contact.create({
          number: chat.id.user,
          chat_id: chat.id._serialized,
          name: chat.name,
        });
      }
    }
  }

  // TODO: addCommand and addMention should be able to accept array of commands and mentions
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
      this.log(`LOADING SCREEN: ${percent} ${message}`);
    });
    this.on("qr", (qr) => {
      this.log(`QR RECEIVED: ${qr}`);
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
      this.#phoneNumber = this.client.info.wid.user;
    });
    this.on("message_revoke_everyone", async (after, before) => {
      if (!before) return;
      if (before.fromMe) return;

      const contact = await before.getContact();
      if (before.isStatus) {
        this.log(`Status terhapus dari ${contact.pushname}:\n${before.body}`);
        return;
      }

      const chat = await before.getChat();

      this.sendMessage(
        before.from,
        `Pesan terhapus dari\n*${contact.pushname}*\n${before.body}`
      );

      // if the message from a group then the message variable will be:
      // Pesan terhapus dari grup GroupName oleh John Doe
      // otherwise the message variable will be:
      // Pesan terhapus dari John Doe
      const message = `Pesan terhapus dari ${
        chat.isGroup
          ? `grup ${chat.name} oleh ${contact.pushname}`
          : contact.pushname
      }`;
      this.log(`${message}:\n${before.body}`);
    });

    this.client.initialize();
  }

  sendMessage(chatId, msg, options = {}) {
    this.client.sendMessage(chatId, msg, options);
    this.log(`Mengirim pesan kepada *${chatId}*\n${msg}`);
  }

  /**
   * Log the message to console and log file
   * @param  {...string} msg
   */
  log(...msg) {
    utils.log(`========[ ${this.name} ]========`, ...msg);
    console.log(`================================\n${this.name}:`, ...msg);
  }

  error(e) {
    console.error(`${this.name}: Error:`, e);
  }

  getMenu(chat) {
    return `\n${this.getAvailableCommandsString(chat)}\n\n${
      this.mentionsString
    }`;
  }

  getAvailableCommandsString(chat) {
    return this.#commands
      .filter((command) => command.isRunnable(chat))
      .map((command) => command.helpMessage)
      .join("\n\n");
  }

  get client() {
    return this.#client;
  }

  get phoneNumber() {
    return this.#phoneNumber;
  }

  get mentionsString() {
    return this.#mentions.map((mention) => mention.helpMessage).join("\n");
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
