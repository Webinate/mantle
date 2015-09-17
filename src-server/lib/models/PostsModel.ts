import {Model} from "./Model";
import {num, text, bool, textArray, date, html} from "./schema-items/SchemaItemFactory";
import {SchemaHtml} from "./schema-items/SchemaHTML";


export class PostsModel extends Model
{
	constructor()
	{
        super("posts");

        this.defaultSchema.add(new text("author", "", 1));
        this.defaultSchema.add(new text("title", "", 1));
        this.defaultSchema.add(new text("slug", "", 1, 512)).setUnique(true);
        this.defaultSchema.add(new text("brief", ""));
        this.defaultSchema.add(new text("featuredImage", ""));
        this.defaultSchema.add(new html("content", "", SchemaHtml.defaultTags.concat("img"), undefined, false));
        this.defaultSchema.add(new bool("public", true));
        this.defaultSchema.add(new textArray("categories", []));
        this.defaultSchema.add(new textArray("tags", []));
        this.defaultSchema.add(new date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new date("lastUpdated", undefined, false, true)).setIndexable(true);
	}
}