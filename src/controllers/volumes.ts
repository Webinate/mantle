import { IConfig } from '../types/all-types';
import { Page, IVolume, IUserEntry } from '../types';
import { Db, ObjectId, Collection, Sort, SortDirection } from 'mongodb';
import { generateRandString, isValidObjectID } from '../utils/utils';
import Controller from './controller';
import { FilesController } from './files';
import ControllerFactory from '../core/controller-factory';
import RemoteFactory from '../core/remotes/remote-factory';
import { Error500, Error404 } from '../utils/errors';
import { UsersController } from './users';
import { VolumeSortType, VolumesGetOptions } from '../core/enums';

export type GetOptions = {
  id: string | ObjectId;
  user: string;
  identifier: string;
  name: string;
};

export type DeleteOptions = {
  user: string;
  _id: string | ObjectId;
};

/**
 * Class responsible for managing volumes and uploads
 */
export class VolumesController extends Controller {
  private static MEMORY_ALLOCATED: number = 5e8; // 500mb

  private _volumes: Collection<IVolume<'server'>>;
  private _filesController: FilesController;
  private _users: UsersController;

  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._volumes = await db.collection<IVolume<'server'>>('volumes');
    this._filesController = ControllerFactory.get('files');
    this._users = ControllerFactory.get('users');
    return this;
  }

  /**
   * Fetches all volume entries from the database
   * @param options Options for defining which volumes to return
   */
  async getMany(options: Partial<VolumesGetOptions> = { index: 0, limit: 10 }) {
    const volumeCollection = this._volumes;
    const search: Partial<IVolume<'server'>> = {};

    if (options.user) {
      if (options.user && (options.user as IUserEntry<'client' | 'server'>)._id) {
        search.user = new ObjectId((options.user as IUserEntry<'client' | 'server'>)._id);
      } else {
        if (ObjectId.isValid(options.user as string)) {
          const user = await this._users.getUser({ id: options.user as string });
          if (user) search.user = new ObjectId(user._id);
          else throw new Error404(`User not found`);
        } else {
          const user = await this._users.getUser({ username: options.user as string });
          if (user) search.user = new ObjectId(user._id);
          else throw new Error404(`User not found`);
        }
      }
    }

    if (options.search) search.name = options.search as string;

    let limit = options.limit !== undefined ? options.limit : 10;
    let index = options.index !== undefined ? options.index : 0;

    // Set the default sort order to ascending
    let sortOrder: SortDirection = 'asc';

    if (options.sortOrder) {
      if (options.sortOrder.toLowerCase() === 'asc') sortOrder = 'asc';
      else sortOrder = 'desc';
    }

    // Sort by the date created
    let sort: Sort | undefined = undefined;

    // Optionally sort by the last updated
    if (options.sortType === VolumeSortType.created) sort = { created: sortOrder };
    else if (options.sortType === VolumeSortType.name) sort = { name: sortOrder };
    else if (options.sortType === VolumeSortType.memory) sort = { memoryUsed: sortOrder };

    // Save the new entry into the database
    const count = await volumeCollection.count(search);
    const volumes = await volumeCollection
      .find(search, { skip: index, limit })
      .sort(sort || [])
      .toArray();
    const toRet: Page<IVolume<'server'>> = {
      limit: limit,
      count: count,
      index: index,
      data: volumes
    };
    return toRet;
  }

  /**
   * Gets a volume by its name or ID
   */
  async get(options: Partial<GetOptions> = {}) {
    const volumeCollection = this._volumes;
    const searchQuery: Partial<IVolume<'server'>> = {};

    if (options.user) {
      const user = await this._users.getUser({ username: options.user });
      if (user) searchQuery.user = new ObjectId(user._id);
      else throw new Error404(`User not found`);
    }

    if (options.name) searchQuery.name = options.name;

    if (options.identifier) searchQuery.identifier = options.identifier;

    if (options.id) searchQuery._id = new ObjectId(options.id);

    const result = await volumeCollection.findOne(searchQuery);

    if (!result) return null;
    else return result;
  }

  /**
   * Updates a volume resource
   * @param id The id of the volume to edit
   * @param token The edit token
   */
  async update(id: string | ObjectId, token: IVolume<'server'>) {
    if (!ObjectId.isValid(id)) throw new Error(`Please use a valid object id`);

    await this._volumes.updateOne({ _id: new ObjectId(id) } as IVolume<'server'>, { $set: token });
    const updatedVolume = this._volumes.findOne({ _id: new ObjectId(id) } as IVolume<'server'>);
    return updatedVolume;
  }

  /**
   * Attempts to remove all data associated with a user
   * @param user The user we are removing
   */
  async removeUser(user: string) {
    await this.remove({ user: user });
    await this._filesController.removeFiles({ user: user });
    return;
  }

  /**
   * Attempts to create a new user volume by first creating the storage on the cloud and then updating the internal DB
   * @param token The volume token to save
   */
  async create(token: Partial<IVolume<'server'>>) {
    const identifier = `webinate-volume-${generateRandString(8).toLowerCase()}`;
    const volumeCollection = this._volumes;

    // Create the new volume
    const volume: Partial<IVolume<'server'>> = {
      name: 'New Volume',
      type: 'local',
      identifier: identifier,
      created: Date.now(),
      memoryUsed: 0,
      memoryAllocated: VolumesController.MEMORY_ALLOCATED,
      ...token
    };

    if (volume!.memoryUsed! > volume!.memoryAllocated!)
      throw new Error500(`memoryUsed cannot be greater than memoryAllocated`);

    // Save the new entry into the database
    const result = await volumeCollection.insertOne(volume as IVolume<'server'>);
    const addedVolume = (await volumeCollection.findOne({ _id: result.insertedId } as IVolume<'server'>)) as IVolume<
      'server'
    >;

    // Attempt to create a new Google volume
    try {
      await RemoteFactory.get(addedVolume.type).createVolume(addedVolume);
    } catch (err) {
      await volumeCollection.deleteOne({ _id: addedVolume._id } as IVolume<'server'>);
      throw new Error(`Could not create remote: ${err.message}`);
    }

    return addedVolume;
  }

  /**
   * Attempts to remove volumes of the given search result. This will also update the file and stats collection.
   * @param searchQuery A valid mongodb search query
   * @returns An array of ID's of the volumes removed
   */
  async remove(options: Partial<DeleteOptions>) {
    const volumeCollection = this._volumes;
    const toRemove: string[] = [];
    const searchQuery: Partial<IVolume<'server'>> = {};

    if (options._id) {
      if (typeof options._id === 'string') {
        if (!isValidObjectID(options._id)) throw new Error('Please use a valid object id');

        searchQuery._id = new ObjectId(options._id);
      } else searchQuery._id = options._id;
    }

    if (options.user) {
      const user = await this._users.getUser({ username: options.user });
      if (user) searchQuery.user = new ObjectId(user._id);
      else throw new Error404(`User not found`);
    }

    // Get all the volumes
    const volumes = await volumeCollection.find(searchQuery).toArray();

    if (options._id && volumes.length === 0) throw new Error('A volume with that ID does not exist');

    // Now delete each one
    const promises: Promise<IVolume<'server'>>[] = [];
    for (let i = 0, l = volumes.length; i < l; i++) promises.push(this.deleteVolume(volumes[i]));

    await Promise.all(promises);
    return toRemove;
  }

  /**
   * Deletes the volume from storage and updates the databases
   */
  private async deleteVolume(volume: IVolume<'server'>) {
    const volumeCollection = this._volumes;

    try {
      // First remove all volume files
      await this._filesController.removeFiles({ volumeId: volume._id });
    } catch (err) {
      throw new Error(`Could not remove the volume: '${err.toString()}'`);
    }

    await RemoteFactory.get(volume.type).removeVolume(volume);

    // Remove the volume entry
    await volumeCollection.deleteOne({ _id: volume._id } as IVolume<'server'>);
    return volume;
  }
}
