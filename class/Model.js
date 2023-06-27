import { data } from "../scripts/utils.js";

export default class Model {
  #table;

  constructor(table, obj) {
    this.#table = table;
    for (const [key, value] of Object.entries(obj)) {
      this[key] = value;
    }
  }

  delete() {
    return Model.delete(this.table, this.id);
  }

  update(obj) {
    return Model.update(this.table, this.id, obj);
  }

  get table() {
    return this.#table;
  }

  static all(table) {
    return data(table).map((model) => new Model(table, model));
  }

  static create(table, obj) {
    const lastId = Math.max(0, ...this.all(table).map((model) => model.id));
    const models = this.all(table);
    obj.id = lastId + 1;
    models.push(obj);
    data(table, models);
    return new Model(table, obj);
  }

  static findBy(table, key, value) {
    const models = this.all(table);
    const model = models.find((model) => model[key] === value);
    if (model) return new Model(table, model);
    else return null;
  }

  static find(table, id) {
    return this.findBy(table, "id", id);
  }

  static delete(table, id) {
    const models = this.all(table);
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;
    const model = models[index];
    models.splice(index, 1);
    data(table, models);
    return new Model(table, model);
  }

  static update(table, id, obj) {
    const models = this.all(table);
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;
    models[index] = { ...models[index], ...obj };
    data(table, models);

    const model = models[index];
    return new Model(table, model);
  }

  static last(table) {
    const models = this.all(table);
    if (models.length === 0) return null;

    const model = models[models.length - 1];
    return new Model(table, model);
  }

  static first(table) {
    const models = this.all(table);
    if (models.length === 0) return null;

    const model = models[0];
    return new Model(table, model);
  }

  static filter(table, callback) {
    const models = this.all(table);
    const filteredModels = models.filter(callback);
    return filteredModels.map((model) => new Model(table, model));
  }
}
