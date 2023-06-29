import Model from "./Model.js";

export default class Group extends Model {
  static _table = "groups";
  static _fields = ["chat_id", "name", "description"];
}
