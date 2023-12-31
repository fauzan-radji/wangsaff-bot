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
    this.#handler = handler;
    this.#inGroup = inGroup;
    this.#inPrivateChat = inPrivateChat;
    this.#beta = beta;

    this.#validateParams(params);
    this.#params = params;
  }

  run(argString, data) {
    const args = {};
    const parts = argString.split(/\s+/);
    const command = parts.shift();

    const requiredParams = this.params.filter((param) => !param.endsWith("?"));

    if (parts.length < requiredParams.length) {
      const errorMessage = `Invalid number of arguments for command ${command}`;
      log(errorMessage);
      console.log(errorMessage);
      return;
    }

    for (let i = 0; i < this.params.length; i++) {
      let param = this.params[i];

      const isTheLast = i === this.params.length - 1;
      const hasPrefix = param.startsWith("...");
      const isOptional = param.endsWith("?");

      if (isOptional) param = param.substring(0, param.length - 1);

      if (!isTheLast || !hasPrefix) {
        args[param] = parts[i];
      } else {
        args[param.substring(3)] = parts.slice(i).join(" ") || undefined;
      }
    }

    return this.#handler({ ...data, args });
  }

  #validateParams(params) {
    // check if there is optional parameter in the middle
    const hasOptional = params.some((param) => param.endsWith("?"));
    if (hasOptional) {
      let optionalParamFound = false;
      for (const param of params)
        if (param.endsWith("?") && !optionalParamFound)
          optionalParamFound = true;
        else if (!param.endsWith("?") && optionalParamFound)
          throw new Error("Optional parameter must be the last parameter");
    }

    // check if ... param is the last param
    const hasRest = params.some((param) => param.startsWith("..."));
    if (hasRest) {
      let restParamFound = false;
      for (const param of params)
        if (param.startsWith("...") && !restParamFound) restParamFound = true;
        else if (param.startsWith("...") && restParamFound)
          throw new Error("Rest parameter must be the last parameter");
    }

    return true;
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
