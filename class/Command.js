import { env } from "../scripts/utils.js";

export default class Command {
  #prompt;
  #handler;
  #inGroup;
  #inPrivateChat;
  #beta;
  constructor({
    prompt,
    handler,
    inGroup = true,
    inPrivateChat = true,
    beta = false,
  }) {
    this.#prompt = prompt;
    this.#handler = handler;
    this.#inGroup = inGroup;
    this.#inPrivateChat = inPrivateChat;
    this.#beta = beta;
  }

  run(...args) {
    this.#handler(...args);
  }

  isRunnable(chat) {
    // check if this command available in group chat
    const isAvailableInGroupChat = chat.isGroup && !this.inGroup;
    if (isAvailableInGroupChat) return false;

    // check if this command available in private chat
    const isAvaliableInPrivateChat = !chat.isGroup && !this.inPrivateChat;
    if (isAvailableInGroupChat) return false;

    // if this is beta command, check if it's available to the user or the chat
    const isInBetaGroup = chat.id._serialized === env("BETA_GROUP");
    if (isInBetaGroup) return false;

    return true;
  }

  get prompt() {
    return this.#prompt;
  }

  get inGroup() {
    return this.#inGroup;
  }

  get inPrivateChat() {
    return this.#inPrivateChat;
  }

  static findByMessage(commands, message) {
    return commands.find((command) =>
      message.startsWith(`${Command.PREFIX}${command.prompt}`)
    );
  }

  static PREFIX = ".";
}
