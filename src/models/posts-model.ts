import { Model } from './model';
import { text, bool, textArray, date, foreignKey } from './schema-items/schema-item-factory';
import { IPost } from '../types/models/i-post';

/**
 * A model for describing posts
 */
export class PostsModel extends Model<IPost<'server'>, IPost<'client' | 'expanded'>> {
  constructor() {
    super('posts');

    this.schema.addItems([
      new foreignKey('author', 'users', { keyCanBeNull: true }),
      new text('title', '', { minCharacters: 1 }),
      new text('slug', '', { maxCharacters: 512, minCharacters: 1 }).setUnique(true).setRequired(true),
      new text('brief', ''),
      new foreignKey('featuredImage', 'files', { keyCanBeNull: true }),
      new foreignKey('document', 'documents', { keyCanBeNull: true }),
      new foreignKey('latestDraft', 'drafts', { keyCanBeNull: true }),
      new bool('public', true),
      new textArray('categories', []),
      new textArray('tags', []),
      new date('createdOn').setIndexable(true),
      new date('lastUpdated', { useNow: true }).setIndexable(true)
    ]);
  }
}
