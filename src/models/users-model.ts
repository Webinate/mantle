import { Model } from './model';
import { IUserEntry } from '../types/models/i-user-entry';
import { foreignKey, text, enums, date, json } from './schema-items/schema-item-factory';
import { UserPrivilege } from '../core/enums';

/**
 * A model for describing comments
 */
export class UsersModel extends Model<IUserEntry<'server'>, IUserEntry<'client' | 'expanded'>> {
  constructor() {
    super('users');

    const defaultPriviledge: UserPrivilege = 'regular';
    const enumValues: UserPrivilege[] = ['admin', 'regular', 'super'];

    this.schema.addItems([
      new text('username', '')
        .setRequired(true)
        .setUnique(true)
        .setReadOnly(true),
      new text('email', '')
        .setRequired(true)
        .setUnique(true)
        .setSensitive(true),
      new text('password', '').setRequired(true).setSensitive(true),
      new text('registerKey', '').setSensitive(true),
      new text('sessionId', '').setSensitive(true),
      new text('passwordTag', '').setSensitive(true),
      new text('avatar', ''),
      new foreignKey('avatarFile', 'files', { keyCanBeNull: true }),
      new enums('privileges', defaultPriviledge, enumValues, { canBeEmpty: false }),
      new json('meta', {}).setSensitive(true),
      new date('createdOn').setIndexable(true).setReadOnly(true),
      new date('lastLoggedIn', { useNow: true }).setIndexable(true).setReadOnly(true)
    ]);
  }
}
