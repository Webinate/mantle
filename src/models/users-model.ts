import { Model } from './model';
import { text, num, date, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class UsersModel extends Model {
  constructor() {
    super( 'users' );

    this.defaultSchema.add( new text( 'username', '' ) ).setRequired( true ).setUnique( true );
    this.defaultSchema.add( new text( 'email', '' ) ).setRequired( true ).setUnique( true );
    this.defaultSchema.add( new text( 'password', '' ) ).setRequired( true );
    this.defaultSchema.add( new text( 'registerKey', '' ) );
    this.defaultSchema.add( new text( 'sessionId', '' ) );
    this.defaultSchema.add( new text( 'passwordTag', '' ) );
    this.defaultSchema.add( new num( 'privileges', 0 ) );
    this.defaultSchema.add( new json( 'meta', {} ) );
    this.defaultSchema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.defaultSchema.add( new date( 'lastLoggedIn', undefined, true ) ).setIndexable( true );
  }
}