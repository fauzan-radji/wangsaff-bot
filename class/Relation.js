export default class Relation {
  constructor(userModel, type, model) {
    this.model = model;
    this.type = type;
    this.table = model.table;
    // FIXME: foreign key?
    this.foreignKey = `${model.table}_id`;

    if (type !== Relation.BELONGS_TO) {
      this.foreignKey = `${userModel.table}_id`;
      model._relations.push(
        new Relation(model, Relation.BELONGS_TO, userModel)
      );
    }
  }

  static HAS_ONE = "hasOne";
  static HAS_MANY = "hasMany";
  static BELONGS_TO = "belongsTo";
}
