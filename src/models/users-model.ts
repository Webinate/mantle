import { Model } from './model';
import { IUserEntry } from 'modepress';
import { text, num, date, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class UsersModel extends Model<IUserEntry> {
  constructor() {
    super( 'users' );

    this.schema.add( new text( 'username', '' ) ).setRequired( true ).setUnique( true );
    this.schema.add( new text( 'email', '' ) ).setRequired( true ).setUnique( true );
    this.schema.add( new text( 'password', '' ) ).setRequired( true );
    this.schema.add( new text( 'registerKey', '' ) );
    this.schema.add( new text( 'sessionId', '' ) );
    this.schema.add( new text( 'passwordTag', '' ) );
    this.schema.add( new text( 'avatar', '' ) );
    this.schema.add( new num( 'privileges', 0 ) );
    this.schema.add( new json( 'meta', {} ) );
    this.schema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}