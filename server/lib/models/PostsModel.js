var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model_1 = require("./Model");
var SchemaItemFactory_1 = require("./schema-items/SchemaItemFactory");
var PostsModel = (function (_super) {
    __extends(PostsModel, _super);
    function PostsModel() {
        _super.call(this, "posts");
        this.defaultSchema.add(new SchemaItemFactory_1.text("author", "", 1));
        this.defaultSchema.add(new SchemaItemFactory_1.text("title", "", 1));
        this.defaultSchema.add(new SchemaItemFactory_1.text("slug", "", 1, 512)).unique(true);
        this.defaultSchema.add(new SchemaItemFactory_1.text("brief", ""));
        this.defaultSchema.add(new SchemaItemFactory_1.text("featuredImage", ""));
        this.defaultSchema.add(new SchemaItemFactory_1.text("content", ""));
        this.defaultSchema.add(new SchemaItemFactory_1.bool("public", true));
        this.defaultSchema.add(new SchemaItemFactory_1.textArray("categories", []));
        this.defaultSchema.add(new SchemaItemFactory_1.textArray("tags", []));
        this.defaultSchema.add(new SchemaItemFactory_1.date("createdOn")).indexable(true);
        this.defaultSchema.add(new SchemaItemFactory_1.date("lastUpdated", undefined, false, true)).indexable(true);
    }
    return PostsModel;
})(Model_1.Model);
exports.PostsModel = PostsModel;
