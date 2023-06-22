import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import path from "../scripts/path.js";

export default class Bot {
  constructor(name) {
    this.name = name;
    this.client = Bot.client();

    this.initialize();
  }

  handleMessage(msg) {
    if (msg.body !== ".ping") return;

    msg.reply("pong");
  }

  on(eventType, callback) {
    this.client.on(eventType, callback);
  }

  initialize() {
    this.on("message", this.handleMessage);
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
      this.log("AUTHENTICATION FAILURE", msg);
    });
    this.on("ready", () => {
      this.log("READY");
    });

    this.client.initialize();
  }

  log(...msg) {
    console.log(`${this.name}:`, ...msg);
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
          "--single-process", // <- this one doesn't works in Windows
          "--disable-gpu",
        ],
        headless: true,
      },
      authStrategy: new LocalAuth({ dataPath: path.root() }),
    });
  }
}
