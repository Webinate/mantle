import { Model } from './model';
import { text, num, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class SessionModel extends Model {
  constructor() {
    super( 'sessions' );
    this.defaultSchema.add( new text( 'sessionId', '' ) );
    this.defaultSchema.add( new json( 'data', {} ) );
    this.defaultSchema.add( new num( 'expiration', 0 ) );
  }
}