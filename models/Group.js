import { Model, Field } from "json-modelizer";

export default class Group extends Model {
  static _table = "groups";
  static _fields = ["chat_id", "name", "description"];
  static schema = {
    chat_id: Field.String,
    name: Field.String,
    description: Field.Text.Default(""),
  };
}
