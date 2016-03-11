var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model_1 = require("./model");
var schema_item_factory_1 = require("./schema-items/schema-item-factory");
var schema_html_1 = require("./schema-items/schema-html");
var PostsModel = (function (_super) {
    __extends(PostsModel, _super);
    function PostsModel() {
        _super.call(this, "posts");
        this.defaultSchema.add(new schema_item_factory_1.text("author", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("title", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("slug", "", 1, 512)).setUnique(true);
        this.defaultSchema.add(new schema_item_factory_1.text("brief", ""));
        this.defaultSchema.add(new schema_item_factory_1.text("featuredImage", ""));
        this.defaultSchema.add(new schema_item_factory_1.html("content", "", schema_html_1.SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new schema_item_factory_1.bool("public", true));
        this.defaultSchema.add(new schema_item_factory_1.textArray("categories", []));
        this.defaultSchema.add(new schema_item_factory_1.textArray("tags", []));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new schema_item_factory_1.date("lastUpdated", undefined, false, true)).setIndexable(true);
    }
    return PostsModel;
})(model_1.Model);
exports.PostsModel = PostsModel;
