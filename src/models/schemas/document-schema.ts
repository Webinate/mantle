import { Schema } from '../schema';
import { IDocument } from '../../types/models/i-document';
import { ISchemaOptions } from '../../types/misc/i-schema-options';

export class DocumentSchema extends Schema<IDocument<'server'>, IDocument<'client'>> {


  public async downloadToken( options?: ISchemaOptions ) {
    const toRet = await super.downloadToken( options );
    return toRet;
  }
}