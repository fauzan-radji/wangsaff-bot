import { log } from "../scripts/utils.js";

export default class Command {
  #prompt;
  #aliases;
  #params;
  #handler;
  #inGroup;
  #inPrivateChat;
  #beta;

  constructor({
    prompt,
    aliases = [],
    params = [],
    handler,
    inGroup = true,
    inPrivateChat = true,
    beta = false,
  }) {
    this.#prompt = prompt;
    this.#aliases = aliases;
    this.#params = params;
    this.#handler = handler;
    this.#inGroup = inGroup;
    this.#inPrivateChat = inPrivateChat;
    this.#beta = beta;
  }

  run(argString, data) {
    const args = {};
    const parts = argString.split(" ");
    const command = parts[0];

    if (parts.length - 1 < this.params.length) {
      const errorMessage = `Invalid number of arguments for command ${command}`;
      log(errorMessage);
      console.log(errorMessage);
      return;
    }

    for (let i = 0; i < this.params.length; i++) {
      const isTheLast = i === this.params.length - 1;
      const hasPrefix = this.params[i].startsWith("...");
      if (!isTheLast || !hasPrefix) {
        args[this.params[i]] = parts[i + 1];
      } else {
        args[this.params[i].substring(3)] = parts.slice(i + 1).join(" ");
      }
    }

    this.#handler({ ...data, args });
  }

  isRunnable(chat) {
    // check if this command available in group chat
    const isAvailableInGroupChat = chat.isGroup && !this.inGroup;
    if (isAvailableInGroupChat) return false;

    // check if this command available in private chat
    const isAvaliableInPrivateChat = !chat.isGroup && !this.inPrivateChat;
    if (isAvaliableInPrivateChat) return false;

    // if this is beta command, check if it's available to the user or the chat
    const isInBetaGroup = chat.id._serialized === process.env.BETA_GROUP;
    if (this.beta && !isInBetaGroup) return false;

    return true;
  }

  get prompt() {
    return `${Command.PREFIX}${this.#prompt}`;
  }

  get aliases() {
    return this.#aliases.map((alias) => `${Command.PREFIX}${alias}`);
  }

  get inGroup() {
    return this.#inGroup;
  }

  get inPrivateChat() {
    return this.#inPrivateChat;
  }

  get beta() {
    return this.#beta;
  }

  get params() {
    return this.#params;
  }

  static findByMessage(commands, message) {
    // find command by prompt or aliases
    return commands.find(
      (command) =>
        message.startsWith(`${Command.PREFIX}${command.#prompt}`) ||
        command.#aliases.some((alias) =>
          message.startsWith(`${Command.PREFIX}${alias}`)
        )
    );
  }

  static PREFIX = ".";
}
