"use strict";
const model_1 = require("./model");
const schema_item_factory_1 = require("./schema-items/schema-item-factory");
class CategoriesModel extends model_1.Model {
    constructor() {
        super("categories");
        this.defaultSchema.add(new schema_item_factory_1.text("title", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("slug", "", 1, 20)).setUnique(true);
        this.defaultSchema.add(new schema_item_factory_1.text("description", ""));
        this.defaultSchema.add(new schema_item_factory_1.text("parent", ""));
    }
}
exports.CategoriesModel = CategoriesModel;
