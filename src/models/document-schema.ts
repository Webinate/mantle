import { Schema } from "./schema";
import { IDocument } from "../types/models/i-document";
// import { ISchemaOptions } from "../types/misc/i-schema-options";
// import { IModelEntry } from "../types/models/i-model-entry";

export class DocumentSchema extends Schema<IDocument<'client' | 'server'>> {

  // // async downloadToken( options?: ISchemaOptions ) {
  // public async downloadToken<Y extends IModelEntry<'client'>>( options?: ISchemaOptions ): Promise<Y> {
  //   const toRet = await super.downloadToken<IDocument<'client'>>( options );
  //   return toRet as IModelEntry<'client'> as Y;
  // }
}