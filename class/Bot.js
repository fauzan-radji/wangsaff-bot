import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import path from "../scripts/path.js";
import Command from "./Command.js";

export default class Bot {
  #commands;

  constructor(name) {
    this.name = name;
    this.client = Bot.client();

    this.#commands = [];

    this.initialize();
  }

  async handleMessage(msg) {
    const command = Command.findByMessage(this.#commands, msg.body);
    if (!command) return;

    const chat = await msg.getChat();

    if (command.isRunnable(chat)) command.run({ msg });
    else {
      const errorMessage = `Command \`\`\`${command.prompt}\`\`\` isn't available here.`;
      msg.reply(errorMessage);
      this.error(errorMessage);
    }
  }

  addCommand(command) {
    this.#commands.push(command);
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
    console.log(path.root());
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
