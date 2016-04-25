"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model_1 = require("./model");
var schema_item_factory_1 = require("./schema-items/schema-item-factory");
var schema_html_1 = require("./schema-items/schema-html");
var CommentsModel = (function (_super) {
    __extends(CommentsModel, _super);
    function CommentsModel() {
        _super.call(this, "comments");
        this.defaultSchema.add(new schema_item_factory_1.text("author", "")).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.text("target", "")).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.text("responseTarget", "")).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.html("content", "", schema_html_1.SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new schema_item_factory_1.bool("public", true));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new schema_item_factory_1.date("lastUpdated", undefined, true)).setIndexable(true);
    }
    return CommentsModel;
}(model_1.Model));
exports.CommentsModel = CommentsModel;
