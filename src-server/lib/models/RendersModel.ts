import {Model} from "./Model";
import {text, date, html} from "./schema-items/SchemaItemFactory";

export class RendersModel extends Model
{
	constructor()
	{
        super("renders");

        this.defaultSchema.add(new text("url", "", 1, 1000, false, false));
        this.defaultSchema.add(new text("html", "", 0, Number.MAX_VALUE, true, false));
        this.defaultSchema.add(new date("expiration", undefined, true, false));
        this.defaultSchema.add(new date("createdOn")).setIndexable(true);
	}
}