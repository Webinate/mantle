import {Model} from "./model";
import {num, text, bool, textArray, date, html, foreignKey} from "./schema-items/schema-item-factory";
import {SchemaHtml} from "./schema-items/schema-html";


export class CommentsModel extends Model
{
	constructor()
	{
        super("comments");

        this.defaultSchema.add(new text("author", "")).setRequired(true)
        this.defaultSchema.add(new foreignKey("post", "", "posts", false)).setRequired(true)
        this.defaultSchema.add(new foreignKey("parent", "", "comments"))
        this.defaultSchema.add(new html( "content", "", SchemaHtml.defaultTags.concat("img"), undefined, true));
        this.defaultSchema.add(new bool("public", true));
        this.defaultSchema.add(new date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new date("lastUpdated", undefined, true)).setIndexable(true);
	}
}