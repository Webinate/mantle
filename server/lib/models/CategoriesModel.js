var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model_1 = require("./Model");
var SchemaItemFactory_1 = require("./schema-items/SchemaItemFactory");
var CategoriesModel = (function (_super) {
    __extends(CategoriesModel, _super);
    function CategoriesModel() {
        _super.call(this, "categories");
        this.defaultSchema.add(new SchemaItemFactory_1.text("title", "", 1));
        this.defaultSchema.add(new SchemaItemFactory_1.text("slug", "", 1, 20)).setUnique(true);
        this.defaultSchema.add(new SchemaItemFactory_1.text("description", ""));
        this.defaultSchema.add(new SchemaItemFactory_1.text("parent", ""));
    }
    return CategoriesModel;
})(Model_1.Model);
exports.CategoriesModel = CategoriesModel;
