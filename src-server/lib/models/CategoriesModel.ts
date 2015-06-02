import {Model} from "./Model";
import {num, text, date} from "./schema-items/SchemaItemFactory";

export class CategoriesModel extends Model
{
	constructor()
	{
        super("categories");

        this.defaultSchema.add(new text("title", "", 1));
        this.defaultSchema.add(new text("slug", "", 1, 20)).unique(true);
        this.defaultSchema.add(new text("description", ""));
        this.defaultSchema.add(new text("parent", ""));
	}
}