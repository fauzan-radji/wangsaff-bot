export default class Mention {
  #name;
  #aliases;
  #handler;
  #beta;
  #helpMessage;

  constructor({ name, aliases = [], handler, beta = false }) {
    this.#name = name;
    this.#aliases = aliases;
    this.#handler = handler;
    this.#beta = beta;

    this.#helpMessage = this.#generateHelpMessage();
  }

  async run(participants, bot, sender) {
    const mentions = [];

    for (const participant of participants) {
      if (
        participant.id.user === bot.phoneNumber ||
        participant.id.user === sender.number
      )
        continue;

      if (this.#handler(participant)) {
        mentions.push(participant.id._serialized);
      }
    }

    return mentions;
  }

  #generateHelpMessage() {
    return `- *${this.name}* ${
      this.aliases.length > 0
        ? `| ${this.aliases.map((alias) => `*${alias}*`).join(", ")}`
        : ""
    }`;
  }

  isRunnable(chat) {
    // this feat only available inside group
    if (!chat.isGroup) return false;

    // if this is beta mention, check if it's available to the user or the chat
    const isInBetaGroup = chat.id._serialized === process.env.BETA_GROUP;
    if (this.beta && !isInBetaGroup) return false;

    return true;
  }

  get name() {
    return `@${this.#name}`;
  }

  get aliases() {
    return this.#aliases.map((alias) => `@${alias}`);
  }

  get helpMessage() {
    return this.#helpMessage;
  }

  get beta() {
    return this.#beta;
  }

  static findByMessage(mentions, message) {
    // find mention by name or aliases
    return mentions.find(
      (mention) =>
        new RegExp(`@\\b${mention.#name}\\b`, "gi").test(message) ||
        mention.#aliases.some((alias) =>
          new RegExp(`@\\b${alias}\\b`, "gi").test(message)
        )
    );
  }
}
