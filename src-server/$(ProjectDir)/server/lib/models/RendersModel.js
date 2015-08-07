var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model_1 = require("./Model");
var SchemaItemFactory_1 = require("./schema-items/SchemaItemFactory");
var RendersModel = (function (_super) {
    __extends(RendersModel, _super);
    function RendersModel() {
        _super.call(this, "renders");
        this.defaultSchema.add(new SchemaItemFactory_1.text("url", "", 1));
        this.defaultSchema.add(new SchemaItemFactory_1.text("html", "", 0, Infinity));
        this.defaultSchema.add(new SchemaItemFactory_1.date("createdOn")).indexable(true);
    }
    return RendersModel;
})(Model_1.Model);
exports.RendersModel = RendersModel;
