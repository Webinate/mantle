import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { Db, ObjectID } from 'mongodb';
import Controller from './controller';
import ModelFactory from '../core/model-factory';
import { TemplatesModel } from '../models/templates-model';
import { ITemplate } from '../types/models/i-template';

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
  private _templates: TemplatesModel;

  constructor( config: IConfig ) {
    super( config );
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize( db: Db ) {
    this._templates = ModelFactory.get( 'templates' );
    return this;
  }

  /**
   * Fetches all templates
   */
  async getMany() {
    const templatesModel = this._templates;

    // Save the new entry into the database
    const responses = await Promise.all( [
      templatesModel.count( {} ),
      templatesModel.findMany<ITemplate<'server'>>( { selector: {}, index: 0, limit: - 1 } )
    ] );
    const schemas = responses[ 1 ];
    const templates = await Promise.all( schemas.map( s => s.downloadToken<ITemplate<'client'>>() ) );

    const toRet: Page<ITemplate<'client'>> = {
      limit: -1,
      count: responses[ 0 ],
      index: 0,
      data: templates
    };

    return toRet;
  }

  /**
   * Gets a volume by its name or ID
   */
  async get( id: string ) {
    const templateModel = this._templates;
    const searchQuery: Partial<ITemplate<'server'>> = {
      _id: new ObjectID( id )
    };
    const result = await templateModel.findOne<ITemplate<'server'>>( searchQuery );

    if ( !result )
      return null;
    else {
      const volume = await result.downloadToken<ITemplate<'client'>>();
      return volume;
    }
  }
}