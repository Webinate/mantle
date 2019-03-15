import { Model } from './model';
import { text, num, json } from './schema-items/schema-item-factory';
import { ISessionEntry } from '../types/models/i-session-entry';

/**
 * A model for describing comments
 */
export class SessionModel extends Model<ISessionEntry<'server'>, ISessionEntry<'client' | 'expanded'>> {
  constructor() {
    super('sessions');
    this.schema.addItems([new text('sessionId', ''), new json('data', {}), new num('expiration', 0)]);
  }
}
