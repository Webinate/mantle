import {Model} from "./Model";
import {text, date} from "./schema-items/SchemaItemFactory";

export class RendersModel extends Model
{
	constructor()
	{
        super("renders");

        this.defaultSchema.add(new text("url", "", 1));
        this.defaultSchema.add(new text("html", "", 0, Infinity));
        this.defaultSchema.add(new date("createdOn")).setIndexable(true);
	}
}