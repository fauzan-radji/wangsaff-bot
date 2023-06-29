import { data } from "../scripts/utils.js";

export default class Model {
  static _table;
  static _fields;
  #table;

  /**
   * @param {Object} obj
   * @param {number} obj.id
   * @param {number} obj._id
   * @returns {Model}
   */
  constructor(obj) {
    console.log(obj);
    this.#table = this.constructor._table;
    this._id = obj.id || obj._id || 0;

    const filteredObj = Object.fromEntries(
      Object.entries(obj).filter(([key]) =>
        this.constructor._fields.includes(key)
      )
    );

    for (const [key, value] of Object.entries(filteredObj)) {
      this[key] = value;
    }
  }

  delete() {
    return this.constructor.delete(this.id);
  }

  update(obj) {
    this.constructor.update(this.id, obj);
    return this.#refresh();
  }

  #refresh() {
    const model = this.constructor.find(this.id);
    if (model) {
      for (const [key, value] of Object.entries(model)) {
        this[key] = value;
      }
    }
    return this;
  }

  get id() {
    return this._id;
  }

  get table() {
    return this.#table;
  }

  static get table() {
    return this._table;
  }

  /**
   * Retrieve all Models from the table
   * @returns {Model[]}
   */
  static all() {
    const table = this.table;
    return data(table).map((model) => new this(model));
  }

  /**
   * Create new Model and save it to the table
   * @param {Object} obj
   * @returns {Model}
   */
  static create(obj) {
    const models = this.all();
    const lastId = Math.max(0, ...models.map((model) => model.id));
    obj.id = lastId + 1;

    const model = new this(obj);
    models.push(model);

    const table = this.table;
    data(table, models);
    return model;
  }

  /**
   * Find a Model by key and value
   * @param {string} key
   * @param {*} value
   * @returns {Model | null}
   */
  static findBy(key, value) {
    const models = this.all();
    const model = models.find((model) => model[key] === value);
    if (model) return model;
    else return null;
  }

  /**
   * Find a Model by id
   * @param {number} id
   * @returns {Model | null}
   */
  static find(id) {
    return this.findBy("_id", id);
  }

  /**
   * Delete a Model by id
   * @param {number} id
   * @returns {Model | null}
   */
  static delete(id) {
    const models = this.all();
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;

    const model = models[index];
    models.splice(index, 1);

    const table = this.table;
    data(table, models);

    return model;
  }

  /**
   * Update a Model by id
   * @param {number} id
   * @param {Object} obj
   * @returns {Model | null}
   */
  static update(id, obj) {
    const models = this.all();
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) return null;

    const model = models[index];
    models[index] = new this({ ...model, ...obj });

    const table = this.table;
    data(table, models);

    return model;
  }

  /**
   * Retrieve the last Model from the table
   * @returns {Model | null}
   */
  static last() {
    const models = this.all();
    if (models.length === 0) return null;

    return models[models.length - 1];
  }

  /**
   * Retrieve the first Model from the table
   * @returns {Model | null}
   */
  static first() {
    const models = this.all();
    if (models.length === 0) return null;

    return models[0];
  }

  /**
   * Retrieve the number of Models in the table that match the callback
   * @param {Function} callback
   * @returns {number}
   */
  static filter(callback) {
    const models = this.all();
    return models.filter(callback);
  }
}
