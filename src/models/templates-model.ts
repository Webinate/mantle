import { Model } from './model';
import { text, textArray } from './schema-items/schema-item-factory';
import { ITemplate } from '../types/models/i-template';

/**
 * A model for describing templates
 */
export class TemplatesModel extends Model<ITemplate<'server'>, ITemplate<'client'>> {
  constructor() {
    super( 'templates' );

    this.schema.addItems( [
      new text( 'name', '' ),
      new text( 'description', '' ),
      new text( 'defaultZone', '' ),
      new textArray( 'zones', [] )
    ] );
  }
}