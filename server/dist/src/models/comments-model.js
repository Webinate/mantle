"use strict";
const model_1 = require("./model");
const schema_item_factory_1 = require("./schema-items/schema-item-factory");
const schema_html_1 = require("./schema-items/schema-html");
class CommentsModel extends model_1.Model {
    constructor() {
        super("comments");
        this.defaultSchema.add(new schema_item_factory_1.text("author", "")).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.foreignKey("target", "", "posts", false)).setRequired(true);
        this.defaultSchema.add(new schema_item_factory_1.text("responseTarget", ""));
        this.defaultSchema.add(new schema_item_factory_1.html("content", "", schema_html_1.SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new schema_item_factory_1.bool("public", true));
        this.defaultSchema.add(new schema_item_factory_1.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new schema_item_factory_1.date("lastUpdated", undefined, true)).setIndexable(true);
    }
}
exports.CommentsModel = CommentsModel;
