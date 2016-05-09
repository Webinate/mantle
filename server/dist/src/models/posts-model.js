"use strict";
const model_1 = require("./model");
const schema_item_factory_1 = require("./schema-items/schema-item-factory");
const schema_html_1 = require("./schema-items/schema-html");
class PostsModel extends model_1.Model {
    constructor() {
        super("posts");
        this.defaultSchema.add(new schema_item_factory_1.text("author", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("title", "", 1));
        this.defaultSchema.add(new schema_item_factory_1.text("slug", "", 1, 512)).setUnique(true).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.text("brief", ""));
        this.defaultSchema.add(new schema_item_factory_1.text("featuredImage", ""));
        this.defaultSchema.add(new schema_item_factory_1.html("content", "", schema_html_1.SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new schema_item_factory_1.bool("public", true));
        this.defaultSchema.add(new schema_item_factory_1.textArray("categories", []));
        this.defaultSchema.add(new schema_item_factory_1.textArray("tags", []));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new schema_item_factory_1.date("lastUpdated", undefined, true)).setIndexable(true);
    }
}
exports.PostsModel = PostsModel;
