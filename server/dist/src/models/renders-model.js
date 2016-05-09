"use strict";
const model_1 = require("./model");
const schema_item_factory_1 = require("./schema-items/schema-item-factory");
class RendersModel extends model_1.Model {
    constructor() {
        super("renders");
        this.defaultSchema.add(new schema_item_factory_1.text("url", "", 1, 1000, false));
        this.defaultSchema.add(new schema_item_factory_1.text("html", "", 0, Number.MAX_VALUE, false));
        this.defaultSchema.add(new schema_item_factory_1.date("expiration", undefined, false));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
    }
}
exports.RendersModel = RendersModel;
