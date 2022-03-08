import { IConfig } from '../types/all-types';
import { Page, ITemplate } from '../types';
import { Db, ObjectId, Collection } from 'mongodb';
import Controller from './controller';

export type GetOptions = {
  id: string;
  user: string;
  identifier: string;
  name: string;
};

/**
 * Class responsible for managing templates
 */
export class TemplatesController extends Controller {
  private _templates: Collection<ITemplate<'server'>>;

  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._templates = await db.collection<ITemplate<'server'>>('templates');
    return this;
  }

  /**
   * Fetches all templates
   */
  async getMany() {
    const templatesModel = this._templates;

    // Save the new entry into the database
    const responses = await Promise.all([templatesModel.count({}), templatesModel.find({}, { skip: 0 }).toArray()]);
    const [count, templates] = responses;

    const toRet: Page<ITemplate<'server'>> = {
      limit: -1,
      count: count,
      index: 0,
      data: templates
    };

    return toRet;
  }

  /**
   * Gets a template by its name or ID
   */
  async get(id: string | ObjectId) {
    const templateModel = this._templates;
    const searchQuery: Partial<ITemplate<'server'>> = {
      _id: new ObjectId(id)
    };
    const result = await templateModel.findOne(searchQuery);

    if (!result) return null;
    else return result;
  }
}
