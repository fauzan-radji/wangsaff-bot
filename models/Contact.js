import { Model, Field } from "json-modelizer";

export default class Contact extends Model {
  static _table = "contacts";
  static schema = {
    number: Field.String,
    chat_id: Field.String,
    name: Field.String,
  };
}
