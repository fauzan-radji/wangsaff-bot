import { env } from "../scripts/utils.js";

export default class Mention {
  #name;
  #handler;
  #beta;

  constructor({ name, handler, beta = false }) {
    this.#name = name;
    this.#handler = handler;
    this.#beta = beta;
  }

  async run(participants, client) {
    const mentions = [];

    for (const participant of participants) {
      if (this.#handler(participant)) {
        const number = await client.getContactById(participant.id._serialized);
        mentions.push(number);
      }
    }

    return mentions;
  }

  isRunnable(chat) {
    // this feat only available inside group
    if (!chat.isGroup) return false;

    // if this is beta mention, check if it's available to the user or the chat
    const isInBetaGroup = chat.id._serialized === env("BETA_GROUP");
    if (this.beta && !isInBetaGroup) return false;

    return true;
  }

  get name() {
    return this.#name;
  }

  get beta() {
    return this.#beta;
  }

  static findByMessage(mentions, message) {
    return mentions.find((mention) =>
      new RegExp(`@\\b${mention.name}\\b`, "gi").test(message)
    );
  }
}
