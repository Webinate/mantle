import { IAuthReq } from '../types/tokens/i-auth-request';
import { ICategory } from '../types/models/i-category';
import * as bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as express from 'express';
import * as compression from 'compression';
import { Router } from './router';
import { admin, identify } from '../decorators/permissions';
import { j200 } from '../decorators/responses';
import { validId } from '../decorators/path-sanity';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { CategoriesController } from '../controllers/categories';
import ControllerFactory from '../core/controller-factory';

/**
 * A controller that deals with the management of categories
 */
export class CategoriesRouter extends Router {
  private _options: IBaseControler;
  private _controller: CategoriesController;

  /**
   * Creates a new instance of the controller
   */
  constructor(options: IBaseControler) {
    super([Factory.get('posts'), Factory.get('categories')]);
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    const router = express.Router();
    this._controller = ControllerFactory.get('categories');

    router.use(compression());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.json());
    router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

    router.get('/', this.getMany.bind(this));
    router.get('/:id', this.getOne.bind(this));
    router.get('/s/:slug', this.getBySlug.bind(this));
    router.put('/:id', this.update.bind(this));
    router.post('/', this.create.bind(this));
    router.delete('/:id', this.remove.bind(this));

    // Register the path
    e.use((this._options.rootPath || '') + '/categories', router);

    await super.initialize(e, db);
    return this;
  }

  /**
   * Returns an array of ICategory items
   */
  @j200()
  private async getMany(req: IAuthReq, res: express.Response) {
    let index: number | undefined = parseInt(req.query.index);
    let limit: number | undefined = parseInt(req.query.limit);
    if (isNaN(index)) index = undefined;
    if (isNaN(limit)) limit = undefined;

    const response = await this._controller.getAll({
      index: index,
      limit: limit,
      expanded: req.query.expanded !== undefined ? req.query.expanded === 'true' : undefined,
      depth: req.query.depth !== undefined ? parseInt(req.query.depth) : undefined,
      root: req.query.root !== undefined ? req.query.root === 'true' : undefined
    });

    return response;
  }

  /**
   * Attempts to update a post by ID
   */
  @j200()
  @admin()
  private async update(req: IAuthReq, res: express.Response) {
    const token: Partial<ICategory<'client'>> = req.body;
    const post = await this._controller.update(req.params.id, token);
    return post;
  }

  /**
   * Returns a single category
   */
  @j200()
  @validId('id', 'ID')
  @identify()
  private async getOne(req: IAuthReq, res: express.Response) {
    return await this._controller.getOne(req.params.id, {
      expanded: req.query.expanded !== undefined ? req.query.expanded === 'true' : undefined,
      depth: req.query.depth !== undefined ? parseInt(req.query.depth) : undefined
    });
  }

  /**
   * Returns a single category by its slug
   */
  @j200()
  @identify()
  private async getBySlug(req: IAuthReq, res: express.Response) {
    return await this._controller.getBySlug(req.params.slug, {
      expanded: req.query.expanded !== undefined ? req.query.expanded === 'true' : undefined,
      depth: req.query.depth !== undefined ? parseInt(req.query.depth) : undefined
    });
  }

  /**
   * Attempts to remove a category by ID
   */
  @j200(204)
  @validId('id', 'ID')
  @admin()
  private async remove(req: IAuthReq, res: express.Response) {
    await this._controller.remove(req.params.id);
  }

  /**
   * Attempts to create a new category item
   */
  @j200()
  @admin()
  private async create(req: IAuthReq, res: express.Response) {
    const token: Partial<ICategory<'client'>> = req.body;
    return await this._controller.create(token);
  }
}
