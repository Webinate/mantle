import { Schema } from '../schema';
import { IDocument } from '../../types/models/i-document';
import { ISchemaOptions } from '../../types/misc/i-schema-options';
import { IDraft } from '../../types/models/i-draft';
import { IDraftElement, IImageElement } from '../../types/models/i-draft-elements';
import { ObjectID, Collection } from 'mongodb';
import ModelFactory from '../../core/model-factory';
import { Model } from '../model';
import { IFileEntry } from '../../types/models/i-file-entry';

export class DocumentSchema extends Schema<IDocument<'server'>, IDocument<'client'>> {
  private _elementsCollection: Collection<IDraftElement<'server'>>;

  public async downloadToken( options?: ISchemaOptions ) {
    const toRet = await super.downloadToken( options );

    if ( toRet.currentDraft && typeof ( toRet.currentDraft ) !== 'string' )
      await this.populateDraft( toRet.currentDraft );

    return toRet;
  }

  setElementCollection( collection: Collection<IDraftElement<'server'>> ) {
    this._elementsCollection = collection;
  }

  clone() {
    const copy = super.clone( new DocumentSchema() ) as DocumentSchema;
    copy._elementsCollection = this._elementsCollection;
    return copy;
  }

  buildHtml( elm: IDraftElement<'client' | 'server'> ) {
    if ( elm.type === 'elm-image' ) {
      const image = ( elm as IImageElement<'client'> ).image;
      if ( image )
        return `<figure><img src="${( image as IFileEntry<'client'> ).publicURL}" /></figure>`;
      else
        return '<figure>Image not found</figure>';
    }

    return elm.html;
  }

  /**
   * Populates a draft json with its elements
   */
  async populateDraft( draft: IDraft<'client' | 'server'> ) {
    const elementsFromDb = await this._elementsCollection.find(
      { parent: new ObjectID( draft._id ) } as IDraftElement<'server'> ).toArray();

    if ( !elementsFromDb || elementsFromDb.length === 0 )
      return;

    const elements = draft.elementsOrder.map( elmId => elementsFromDb.find( elm => elm._id.toString() === elmId )! );

    const jsons = await Promise.all(

      elements.map( elm => {
        const model = ModelFactory.get( elm.type ) as Model<IDraftElement<'server'>, IDraftElement<'client'>>;
        const schema = model.schema.clone();

        schema.setServer( elm as IDraftElement<'server'>, true );

        return schema.downloadToken( {
          expandMaxDepth: 1,
          expandForeignKeys: true,
          verbose: true,
          expandSchemaBlacklist: [ /parent/ ]
        } );
      } )

    );

    const htmlMap: { [ zone: string ]: string } = {};
    draft.elements = jsons;

    for ( const elm of draft.elements ) {
      elm.html = this.buildHtml( elm );

      if ( !htmlMap[ elm.zone ] )
        htmlMap[ elm.zone ] = elm.html;
      else
        htmlMap[ elm.zone ] += elm.html;
    }

    draft.html = htmlMap;
  }
}