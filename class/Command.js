export default class Command {
  #prompt;
  #aliases;
  #handler;
  #inGroup;
  #inPrivateChat;
  #beta;

  constructor({
    prompt,
    aliases = [],
    handler,
    inGroup = true,
    inPrivateChat = true,
    beta = false,
  }) {
    this.#prompt = prompt;
    this.#aliases = aliases;
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
