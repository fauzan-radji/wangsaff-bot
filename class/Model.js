import { data } from "../scripts/utils.js";

export default class Model {
  constructor(obj) {
    for (const [key, value] of Object.entries(obj)) {
      this[key] = value;
    }
  }

  static all(name) {
    return data(name).map((model) => new Model(model));
  }
}
