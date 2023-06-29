import { data } from "../scripts/utils.js";

export default class Model {
  static _table;
  static _fields;
  #table;

  constructor(obj) {
    this.#table = this.constructor._table;

    const filteredObj = Object.fromEntries(
      Object.entries(obj).filter(
        ([key]) => this.constructor._fields.includes(key) || key === "id"
      )
    );

    for (const [key, value] of Object.entries(filteredObj)) {
      this[key] = value;
    }
  }

  delete() {
    return this.contructor.delete(this.table, this.id);
  }

  update(obj) {
    return this.contructor.update(this.table, this.id, obj);
  }

  get table() {
    return this.#table;
  }

  static get table() {
    return this._table;
  }

  static all() {
    const table = this.table;
    return data(table).map((model) => new this(model));
  }

  static create(obj) {
    const table = this.table;
    const lastId = Math.max(0, ...this.all(table).map((model) => model.id));
    const models = this.all();
    obj.id = lastId + 1;
    const model = new this(obj);
    models.push(model);
    data(table, models);
    return model;
  }

  static findBy(key, value) {
    const table = this.table;
    const models = this.all();
    const model = models.find((model) => model[key] === value);
    if (model) return new this(model);
    else return null;
  }

  static find(id) {
    return this.findBy("id", id);
  }

  static delete(id) {
    const table = this.table;
    const models = this.all();
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;
    const model = models[index];
    models.splice(index, 1);
    data(table, models);
    return new this(model);
  }

  static update(id, obj) {
    const table = this.table;
    const models = this.all();
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;
    models[index] = { ...models[index], ...obj };
    data(table, models);

    const model = models[index];
    return new this(model);
  }

  static last() {
    const models = this.all();
    if (models.length === 0) return null;

    const model = models[models.length - 1];
    return new this(model);
  }

  static first() {
    const models = this.all();
    if (models.length === 0) return null;

    const model = models[0];
    return new this(model);
  }

  static filter(callback) {
    const models = this.all();
    const filteredModels = models.filter(callback);
    return filteredModels.map((model) => new this(model));
  }
}
