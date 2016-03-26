"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model_1 = require("./model");
var schema_item_factory_1 = require("./schema-items/schema-item-factory");
var CategoriesModel = (function (_super) {
    __extends(CategoriesModel, _super);
    function CategoriesModel() {
        _super.call(this, "categories");
        this.defaultSchema.add(new schema_item_factory_1.text("title", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("slug", "", 1, 20)).setUnique(true);
        this.defaultSchema.add(new schema_item_factory_1.text("description", ""));
        this.defaultSchema.add(new schema_item_factory_1.text("parent", ""));
    }
    return CategoriesModel;
}(model_1.Model));
exports.CategoriesModel = CategoriesModel;
