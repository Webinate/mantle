var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model_1 = require("./model");
var schema_item_factory_1 = require("./schema-items/schema-item-factory");
var RendersModel = (function (_super) {
    __extends(RendersModel, _super);
    function RendersModel() {
        _super.call(this, "renders");
        this.defaultSchema.add(new schema_item_factory_1.text("url", "", 1, 1000, false, false));
        this.defaultSchema.add(new schema_item_factory_1.text("html", "", 0, Number.MAX_VALUE, true, false));
        this.defaultSchema.add(new schema_item_factory_1.date("expiration", undefined, true, false));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
    }
    return RendersModel;
})(model_1.Model);
exports.RendersModel = RendersModel;
