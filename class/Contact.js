import Model from "./Model.js";

export default class Contact extends Model {
  static _table = "contacts";
  static _fields = ["number", "chat_id", "name"];
}
