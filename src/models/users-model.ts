import { Model } from './model';
import { IUserEntry } from '../types/models/i-user-entry';
import { foreignKey, text, num, date, json } from './schema-items/schema-item-factory';

/**
 * A model for describing comments
 */
export class UsersModel extends Model<IUserEntry<'client' | 'server'>> {
  constructor() {
    super( 'users' );

    this.schema.add( new text( 'username', '' ) ).setRequired( true ).setUnique( true );
    this.schema.add( new text( 'email', '' ) ).setRequired( true ).setUnique( true ).setSensitive( true );
    this.schema.add( new text( 'password', '' ) ).setRequired( true ).setSensitive( true );
    this.schema.add( new text( 'registerKey', '' ) ).setSensitive( true );
    this.schema.add( new text( 'sessionId', '' ) ).setSensitive( true );
    this.schema.add( new text( 'passwordTag', '' ) ).setSensitive( true );
    this.schema.add( new text( 'avatar', '' ) );
    this.schema.add( new foreignKey( 'avatarFile', 'files', { keyCanBeNull: true, nullifyOnDelete: true } ) );
    this.schema.add( new num( 'privileges', 0 ) );
    this.schema.add( new json( 'meta', {} ) ).setSensitive( true );
    this.schema.add( new date( 'createdOn' ) ).setIndexable( true );
    this.schema.add( new date( 'lastLoggedIn', undefined ) ).setIndexable( true );
  }
}