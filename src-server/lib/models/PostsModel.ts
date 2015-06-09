import {Model} from "./Model";
import {num, text, bool, textArray, date} from "./schema-items/SchemaItemFactory";

export class PostsModel extends Model
{
	constructor()
	{
        super("posts");

        this.defaultSchema.add(new text("author", "", 1));
        this.defaultSchema.add(new text("title", "", 1));
        this.defaultSchema.add(new text("slug", "", 1, 20)).unique(true);
        this.defaultSchema.add(new text("featuredImage", ""));
        this.defaultSchema.add(new text("content", ""));
        this.defaultSchema.add(new bool("public", true));
        this.defaultSchema.add(new textArray("categories", []));
        this.defaultSchema.add(new textArray("tags", []));
        this.defaultSchema.add(new date("createdOn"));
        this.defaultSchema.add(new date("lastUpdated", undefined, false, true ));
	}
}