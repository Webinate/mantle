import {Model} from "./model";
import {num, text, bool, textArray, date, html} from "./schema-items/schema-item-factory";
import {SchemaHtml} from "./schema-items/schema-html";


export class CommentsModel extends Model
{
	constructor()
	{
        super("comments");

        this.defaultSchema.add(new text("author", "")).setRequired(true)
        this.defaultSchema.add(new text("target", "")).setRequired(true)
        this.defaultSchema.add(new text("responseTarget", "")).setRequired(true)
        this.defaultSchema.add(new html("content", "", SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new bool("public", true));
        this.defaultSchema.add(new date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new date("lastUpdated", undefined, true)).setIndexable(true);
	}
}