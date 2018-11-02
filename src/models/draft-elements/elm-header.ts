import { Model } from '../model';
import { foreignKey, text, html } from '../schema-items/schema-item-factory';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';
import { SchemaHtml } from '../schema-items/schema-html';

/**
 * A model for describing header elements
 */
export class ElmHeader extends Model<IDraftElement<'client' | 'server'>> {
  constructor( type: DraftElements ) {
    super( 'elements' );

    let allowedTags = SchemaHtml.inlineTags;

    if ( type === 'elm-header-1' )
      allowedTags = allowedTags.concat( [ 'h1' ] )
    else if ( type === 'elm-header-2' )
      allowedTags = allowedTags.concat( [ 'h2' ] )
    else if ( type === 'elm-header-3' )
      allowedTags = allowedTags.concat( [ 'h3' ] )
    else if ( type === 'elm-header-4' )
      allowedTags = allowedTags.concat( [ 'h4' ] )
    else if ( type === 'elm-header-5' )
      allowedTags = allowedTags.concat( [ 'h5' ] )
    else if ( type === 'elm-header-6' )
      allowedTags = allowedTags.concat( [ 'h6' ] )

    this.schema.addItems( [
      new foreignKey( 'parent', 'drafts', { keyCanBeNull: false } ),
      new text( 'type', type ),
      new html( 'html', '', { allowedTags: allowedTags } )
    ] );
  }
}