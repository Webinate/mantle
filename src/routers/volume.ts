import { IAuthReq } from '../types/tokens/i-auth-request';
import express = require('express');
import bodyParser = require('body-parser');
import * as mongodb from 'mongodb';
import ControllerFactory from '../core/controller-factory';
import { VolumesController } from '../controllers/volumes';
import { Router } from './router';
import * as compression from 'compression';
import { j200 } from '../decorators/responses';
import { isAuthorizedRest } from '../decorators/permissions';
import { validId } from '../decorators/path-sanity';
import { IBaseControler } from '../types/misc/i-base-controller';
import Factory from '../core/model-factory';
import { IVolume } from '../types/models/i-volume-entry';
import { Error403, Error404 } from '../utils/errors';
import { IUserEntry } from '../types/models/i-user-entry';

/**
 * Main class to use for managing users
 */
export class VolumeRouter extends Router {
  private _options: IBaseControler;
  private _volumeController: VolumesController;

  /**
   * Creates an instance of the user manager
   */
  constructor(options: IBaseControler) {
    super([Factory.get('volumes')]);
    this._options = options;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: express.Express, db: mongodb.Db) {
    this._volumeController = ControllerFactory.get('volumes');

    // Setup the rest calls
    const router = express.Router();
    router.use(compression());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.json());
    router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

    router.get('/', this.getVolumes.bind(this));
    router.get('/:id', this.getOne.bind(this));
    router.put('/:id', this.update.bind(this));
    router.delete('/:id', this.removeVolumes.bind(this));
    router.post('/', this.createVolume.bind(this));

    // Register the path
    e.use((this._options.rootPath || '') + `/volumes`, router);

    await super.initialize(e, db);
    return this;
  }

  @j200()
  @validId('id', 'ID')
  @isAuthorizedRest()
  private async getOne(req: IAuthReq, res: express.Response) {
    const volume = await this._volumeController.get({ id: req.params.id });

    if (!volume) throw new Error('Volume does not exist');

    if (!req._isAdmin && (volume.user as IUserEntry<'client'>).username !== req._user!.username) throw new Error403();

    return volume;
  }

  /**
   * Attempts to update a volume by ID
   */
  @j200()
  @validId('id', 'ID')
  @isAuthorizedRest()
  private async update(req: IAuthReq, res: express.Response) {
    const token: IVolume<'client'> = req.body;

    if (token.memoryAllocated !== undefined && !req._isAdmin)
      throw new Error403(`You don't have permission to set the memoryAllocated`);
    if (token.memoryUsed !== undefined && !req._isAdmin)
      throw new Error403(`You don't have permission to set the memoryUsed`);

    const volume = await this._volumeController.get({ id: req.params.id });

    if (!volume) throw new Error404('Volume does not exist');

    if (!req._isAdmin && volume && (volume.user as IUserEntry<'client'>).username !== req._user!.username)
      throw new Error403();

    const vol = await this._volumeController.update(req.params.id, token);
    return vol;
  }

  /**
   * Removes volumes specified in the URL
   */
  @j200(204)
  @isAuthorizedRest()
  private async removeVolumes(req: IAuthReq, res: express.Response) {
    await this._volumeController.remove({ _id: req.params.id as string });
    return;
  }

  /**
   * Fetches all volume entries from the database
   */
  @j200()
  @isAuthorizedRest()
  private async getVolumes(req: IAuthReq, res: express.Response) {
    const authUser = req._user!;
    const manager = this._volumeController;
    let search: RegExp | undefined;

    // Check for keywords
    if (req.query.search) search = new RegExp(req.query.search, 'i');

    let index: number | undefined = parseInt(req.query.index);
    let limit: number | undefined = parseInt(req.query.limit);
    let user: string | undefined = req.query.user;
    index = isNaN(index) ? undefined : index;
    limit = isNaN(limit) ? undefined : limit;

    let getAll = false;

    if (req._isAdmin === false && user !== undefined) throw new Error403();
    else if (req._isAdmin && user === undefined) getAll = true;

    const toRet = await manager.getMany({
      user: getAll ? undefined : user ? user : authUser,
      search: search,
      sort: req.query.sort ? req.query.sort.toLowerCase() : undefined,
      sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      index: index,
      limit: limit
    });

    return toRet;
  }

  /**
   * Creates a new user volume based on the target provided
   */
  @j200()
  @isAuthorizedRest()
  private async createVolume(req: IAuthReq, res: express.Response) {
    const token: IVolume<'client'> = req.body;
    const manager = this._volumeController;

    if (!token.user) token.user = req._user!._id.toString();
    else if (!req._isAdmin) throw new Error403();

    if (token.memoryAllocated !== undefined && !req._isAdmin)
      throw new Error403(`You don't have permission to set the memoryAllocated`);
    if (token.memoryUsed !== undefined && !req._isAdmin)
      throw new Error403(`You don't have permission to set the memoryUsed`);

    const entry = (await manager.create(token)) as IVolume<'client'>;
    return entry;
  }
}
