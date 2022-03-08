import { IAuthReq } from '../types/tokens/i-auth-request';
import { Router as ExpressRouter, Response, urlencoded, json, Express, RequestHandler } from 'express';
import { Router } from './router';
import ControllerFactory from '../core/controller-factory';
import * as compression from 'compression';
import { j200 } from '../decorators/responses';
import { isAuthorizedRest } from '../decorators/permissions';
import * as mongodb from 'mongodb';
import { FilesController } from '../controllers/files';
import { IFileEntry } from '../types/models/i-file-entry';
import { Error403 } from '../utils/errors';
import { SortOrder } from '../core/enums';

/**
 * Main class to use for managing users
 */
export class FileRouter extends Router {
  private _rootPath: string;
  private _files: FilesController;

  constructor(rootPath: string) {
    super();
    this._rootPath = rootPath;
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize(e: Express, db: mongodb.Db) {
    this._files = ControllerFactory.get('files');

    // Setup the rest calls
    const router = ExpressRouter();
    router.use(compression());
    router.use(urlencoded({ extended: true }) as RequestHandler);
    router.use(json() as RequestHandler);
    router.use(json({ type: 'application/vnd.api+json' }) as RequestHandler);

    router.get('/volumes/:volume', this.getFiles.bind(this));
    router.delete('/:file', this.remove.bind(this));
    router.put('/:file', this.update.bind(this));
    router.post('/volumes/:volume/upload/:directory?', this.upload.bind(this));
    router.post('/replace/:fileId', this.replace.bind(this));

    // Register the path
    e.use((this._rootPath || '') + `/files`, router);

    await super.initialize(e, db);
    return this;
  }

  /**
   * Removes a file specified in the URL
   */
  @j200(204)
  @isAuthorizedRest()
  private async remove(req: IAuthReq, res: Response) {
    await this._files.removeFiles({
      fileId: req.params.file,
      user: req._isAdmin ? undefined : (req._user!.username as string)
    });
  }

  /**
   * Renames a file
   */
  @j200()
  @isAuthorizedRest()
  private async update(req: IAuthReq, res: Response) {
    const file = req.body as Partial<IFileEntry<'server' | 'client'>>;

    if (!req._isAdmin && file.user) throw new Error403('Permission denied - cannot set user as non-admin');

    delete file.size;
    delete file.numDownloads;
    delete file.mimeType;
    delete file.publicURL;
    delete file.identifier;

    return await this._files.update(req.params.file, file as IFileEntry<'server'>);
  }

  /**
   * Fetches all file entries from the database. Optionally specifying the volume to fetch from.
   */
  @j200()
  @isAuthorizedRest()
  private async getFiles(req: IAuthReq, res: Response) {
    let index: number | undefined = parseInt(req.query.index as string);
    let limit: number | undefined = parseInt(req.query.limit as string);
    index = isNaN(index) ? undefined : index;
    limit = isNaN(limit) ? undefined : limit;

    if (!req.params.volume || req.params.volume.trim() === '') throw new Error('Please specify a valid volume name');

    const page = await this._files.getFiles({
      volumeId: req.params.volume,
      index: index,
      limit: limit,
      sortType: req.query.sortType ? ((req.query.sortType as string).toLowerCase() as any) : undefined,
      sortOrder: req.query.sortOrder === SortOrder.asc ? SortOrder.asc : SortOrder.desc,
      user: req._isAdmin ? undefined : (req._user!.username as string),
      search: req.query.search ? new RegExp(req.query.search as string, 'i') : undefined
    });

    return page;
  }

  @j200()
  @isAuthorizedRest()
  private async upload(req: IAuthReq) {
    const volumeId = req.params.volume;

    if (!mongodb.ObjectId.isValid(volumeId)) throw new Error(`Incorrect volume id format`);

    return this._files.uploadFilesToVolume(req, volumeId, req._user!._id.toString());
  }

  @j200()
  @isAuthorizedRest()
  private async replace(req: IAuthReq) {
    const fileId = req.params.fileId;

    if (!mongodb.ObjectId.isValid(fileId)) throw new Error(`Incorrect file id format`);

    return this._files.replaceFileContent(req, fileId, req._user!._id.toString());
  }
}
