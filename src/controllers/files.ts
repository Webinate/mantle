﻿import { IConfig } from '../types/config/i-config';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';
import { IVolume } from '../types/models/i-volume-entry';
import { Db, ObjectId, Collection, Sort, SortDirection } from 'mongodb';
import RemoteFactory from '../core/remotes/remote-factory';
import Controller from './controller';
import { isValidObjectID } from '../utils/utils';
import ControllerFactory from '../core/controller-factory';
import { IAuthReq } from '../types/tokens/i-auth-request';
import { unlink, exists } from 'fs';
import * as path from 'path';
import { IncomingForm, Fields, File, Part } from 'formidable';
import * as winston from 'winston';
import { Error404, Error500, Error400 } from '../utils/errors';
import { UsersController } from './users';
import { IUploadToken } from '../types/interfaces/i-remote';
import { SortOrder, FileSortType, FilesGetOptions, FileDeleteOptions } from '../core/enums';

/**
 * Class responsible for managing files
 */
export class FilesController extends Controller {
  private _files: Collection<IFileEntry<'server'>>;
  private _volumes: Collection<IVolume<'server'>>;
  private _allowedFileTypes: Array<string>;
  private _users: UsersController;

  constructor(config: IConfig) {
    super(config);
  }

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  async initialize(db: Db) {
    this._files = await db.collection<IFileEntry<'server'>>('files');
    this._volumes = await db.collection<IVolume<'server'>>('volumes');
    this._users = ControllerFactory.get('users');
    this._allowedFileTypes = [
      'image/bmp',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/tiff',
      'text/plain',
      'text/json',
      'application/octet-stream'
    ];
    return this;
  }

  /**
   * Fetches a file by its ID
   * @param fileID The file ID
   */
  async getFile(fileID: string | ObjectId) {
    const files = this._files;
    const searchQuery: Partial<IFileEntry<'server'>> = { _id: new ObjectId(fileID) };

    const file = await files.findOne(searchQuery);
    return file;
  }

  /**
   * Fetches all file entries by a given query
   */
  async getFiles(options: FilesGetOptions) {
    const files = this._files;
    const volumes = this._volumes;

    const searchQuery: Partial<IFileEntry<'server'>> = {};

    if (options.volumeId) {
      if (typeof options.volumeId === 'string' && !isValidObjectID(options.volumeId))
        throw new Error('Please use a valid identifier for volumeId');

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectId(options.volumeId) };
      if (options.user) {
        const user = await this._users.getUser({ username: options.user });
        if (user) volumeQuery.user = user._id;
        else throw new Error404(`User not found`);
      }

      const volume = await volumes.findOne(volumeQuery);
      if (!volume) throw new Error(`Could not find the volume resource`);

      searchQuery.volumeId = volume._id;
    }

    if (options.search) searchQuery.name = new RegExp(options.search);

    if (options.user) {
      const u = await this._users.getUser({ username: options.user });
      if (!u) throw new Error404(`User not found`);

      searchQuery.user = u._id;
    }

    // Set the default sort order to ascending
    let sortOrder: SortDirection = 'asc';

    if (options.sortOrder) {
      if (options.sortOrder === SortOrder.asc) sortOrder = 'asc';
      else sortOrder = 'desc';
    }

    // Sort by the date created
    let sort: Sort | undefined = undefined;

    // Optionally sort by the last updated
    if (options.sortType === FileSortType.created) sort = { created: sortOrder };
    else if (options.sortType === FileSortType.name) sort = { name: sortOrder };
    else if (options.sortType === FileSortType.memory) sort = { size: sortOrder };

    const count = await files.count(searchQuery);
    const index: number = options.index || 0;
    const limit: number = options.limit || 10;

    const sanitizedData = await files
      .find(searchQuery, { skip: index, limit })
      .sort(sort || [])
      .toArray();

    const toRet: Page<IFileEntry<'server'>> = {
      count: count,
      data: sanitizedData,
      index: index,
      limit: limit
    };

    return toRet;
  }

  private removeTempFiles(files: File[]) {
    files.forEach(file => {
      exists(file.path, function(exists) {
        if (exists) {
          unlink(file.path, function(err) {
            if (err) winston.error(err.message);
          });
        }
      });
    });
  }

  private uploadFormToTempDir(req: IAuthReq) {
    return new Promise<{ fields: Fields; files: File[] }>((resolve, reject) => {
      const form = new IncomingForm();
      const filesArr: File[] = [];
      let fieldsToRet: Fields;
      let error: Error | null = null;

      form.encoding = 'utf-8';
      form.keepExtensions = true;
      form.maxFields = 1000; // Max number of allowed fields
      form.maxFieldsSize = 20 * 1024 * 1024; // Max size allowed for fields
      form.maxFileSize = this._config.remotes.maxFileSize || 20 * 1024 * 1024; // Max size allowed for files
      form.multiples = false;
      form.uploadDir = path.resolve(__dirname + '/../../temp');

      form.onPart = (part: Part) => {
        if (part.mime) {
          const allowedTypes = this._allowedFileTypes;
          const extension = part.mime.toLowerCase();

          if (allowedTypes.indexOf(extension) !== -1) form.handlePart(part);
          else error = new Error(`Extension ${extension} not supported`);
        } else {
          form.handlePart(part);
        }
      };

      form.parse(req, (err, fields, files) => {
        if (err) {
          // Not sure why - but we need to have a timeout here as without it we get
          // an error write write ECONNABORTED
          setTimeout(() => reject(err), 500);
          return;
        }

        fieldsToRet = fields;
        for (const key in files) filesArr.push(files[key]);
      });

      form.on('end', () => {
        if (error) {
          this.removeTempFiles(filesArr);
          return reject(error);
        } else {
          return resolve({ fields: fieldsToRet, files: filesArr });
        }
      });
    });
  }

  async uploadFileToRemote(
    file: File,
    volume: IVolume<'server'>,
    removeFile: boolean = true,
    existinFile: IFileEntry<'server'> | null = null
  ) {
    const filesModel = this._files;
    const volumesModel = this._volumes;

    file.path = path.resolve(file.path);
    let uploadToken: IUploadToken | null = null;

    // Upload the file to the remote
    try {
      uploadToken = await RemoteFactory.get(volume.type).uploadFile(volume, file);
    } catch (err) {
      // Remove temp file
      if (removeFile) await this.removeTempFiles([file]);

      throw new Error500(err.message);
    }

    // Create the file entry
    const fileData: Partial<IFileEntry<'server'>> = {
      identifier: uploadToken!.id,
      publicURL: uploadToken!.url,
      name: file.name,
      created: Date.now(),
      size: file.size,
      mimeType: file.type,
      user: volume.user,
      isPublic: true,
      numDownloads: 0,
      volumeId: volume._id
    };

    let newFile: IFileEntry<'server'> | null = existinFile;
    let newVolumeSize = volume.memoryUsed;

    if (!newFile) {
      newVolumeSize = newVolumeSize + fileData.size!;
      const response = await filesModel.insertOne(fileData as IFileEntry<'server'>);
      newFile = await filesModel.findOne({ _id: response.insertedId } as IFileEntry<'server'>);
    } else {
      newVolumeSize = newVolumeSize - newFile.size + fileData.size!;
      await filesModel.updateOne({ _id: newFile._id } as IFileEntry<'server'>, { $set: fileData });
      newFile = await filesModel.findOne({ _id: newFile._id } as IFileEntry<'server'>);
    }

    await volumesModel.updateOne({ identifier: volume.identifier } as IVolume<'server'>, {
      $set: { memoryUsed: newVolumeSize }
    });

    // Remove temp file
    if (removeFile) await this.removeTempFiles([file]);

    // Return the new file
    return newFile!;
  }

  /**
   * Uploads files from a from data request to the temp folder
   * @param req The request to process form data
   * @param volumeId The id of the volume to upload to
   * @param username The username of the uploader
   */
  async uploadFilesToVolume(req: IAuthReq, volumeId: string, userId: string | ObjectId) {
    if (!volumeId || volumeId.trim() === '') throw new Error(`Please specify a volume for the upload`);

    const volumeSchema = await this._volumes.findOne({
      _id: new ObjectId(volumeId),
      user: new ObjectId(userId)
    } as Partial<IVolume<'server'>>);

    if (!volumeSchema) throw new Error(`Volume does not exist`);

    const response = await this.uploadFormToTempDir(req);

    let memory = 0;
    for (const f of response.files) memory += f.size;

    if (memory + volumeSchema.memoryUsed > volumeSchema.memoryAllocated) {
      await this.removeTempFiles(response.files);
      throw new Error(`You dont have sufficient memory in the volume`);
    }

    const proimises: Promise<IFileEntry<'server'>>[] = [];
    for (const file of response.files) proimises.push(this.uploadFileToRemote(file, volumeSchema));

    const fileEntries = await Promise.all(proimises);
    return fileEntries;
  }

  /**
   * Uploads a file to replace an existing file's content
   * @param req The request to process form data
   * @param fileId The id of the file to replace
   * @param username The username of the uploader
   */
  async replaceFileContent(req: IAuthReq, fileId: string, userId: string | ObjectId) {
    if (!fileId || fileId.trim() === '') throw new Error(`Please specify a volume for the upload`);

    const file = await this._files.findOne({ _id: new ObjectId(fileId) } as IFileEntry<'server'>);

    if (!file) throw new Error404('File not found');

    const volumeSchema = await this._volumes.findOne({
      _id: file.volumeId,
      user: new ObjectId(userId)
    } as Partial<IVolume<'server'>>);

    if (!volumeSchema) throw new Error(`Volume does not exist`);

    const response = await this.uploadFormToTempDir(req);

    let memory = 0;
    for (const f of response.files) memory += f.size;

    if (response.files.length > 1) {
      await this.removeTempFiles(response.files);
      throw new Error400(`You must only upload 1 file when replacing`, 400);
    }

    if (memory + volumeSchema.memoryUsed > volumeSchema.memoryAllocated) {
      await this.removeTempFiles(response.files);
      throw new Error(`You dont have sufficient memory in the volume`);
    }

    await this.deleteFile(file, false);

    const proimises: Promise<IFileEntry<'server'>>[] = [];
    for (const f of response.files) proimises.push(this.uploadFileToRemote(f, volumeSchema, true, file));

    const fileEntries = await Promise.all(proimises);
    return fileEntries;
  }

  /**
   * Fetches the file count based on the given query
   * @param searchQuery The search query to idenfify files
   */
  async count(searchQuery: IFileEntry<'server'>) {
    const files = this._files;
    const count = await files.count(searchQuery);
    return count;
  }

  /**
   * Renames a file
   * @param fileId The id of the file to rename
   * @param name The new name of the file
   */
  async update(fileId: string | ObjectId, token: Partial<IFileEntry<'server'>>) {
    const files = this._files;

    if (typeof fileId === 'string' && !isValidObjectID(fileId)) throw new Error('Invalid ID format');

    const query = typeof fileId === 'string' ? { _id: new ObjectId(fileId) } : { _id: fileId };
    let file = await this._files.findOne(query);

    if (!file) throw new Error404('Resource not found');

    await files.updateOne(query, { $set: token });
    file = await this._files.findOne(query);
    return file;
  }

  /**
   * Deletes the file from storage and updates the databases
   * @param fileEntry
   */
  private async deleteFile(fileEntry: IFileEntry<'server'>, removeFileEntry: boolean = true) {
    const files = this._files;
    const promises: Promise<any>[] = [];

    // First remove any files that have this as their parent
    const children = await files.find({ parentFile: fileEntry._id } as Partial<IFileEntry<'server'>>).toArray();
    for (const child of children) promises.push(this.deleteFile(child));

    await Promise.all(promises);

    const volumes = this._volumes;
    const volume = await volumes.findOne(fileEntry.volumeId);

    if (volume) {
      // Get the volume and delete the file
      await RemoteFactory.get(volume.type).removeFile(volume, fileEntry);

      // Update the volume data usage
      await volumes.updateOne({ identifier: volume.identifier } as IVolume<'server'>, {
        $set: { memoryUsed: volume.memoryUsed - fileEntry.size! } as Partial<IVolume<'server'>>
      });
    }

    if (removeFileEntry) {
      await files.deleteOne({ _id: fileEntry._id } as IFileEntry<'server'>);
      await ControllerFactory.get('users').onFileRemoved(fileEntry);
      await ControllerFactory.get('posts').onFileRemoved(fileEntry);
    }

    return fileEntry;
  }

  /**
   * Attempts to remove files from the cloud and database by a query
   * @param searchQuery The query we use to select the files
   * @returns Returns the file IDs of the files removed
   */
  async removeFiles(options: FileDeleteOptions) {
    const files = this._files;
    const volumes = this._volumes;
    const query: Partial<IFileEntry<'server'>> = {};

    if (options.volumeId !== undefined) {
      if (typeof options.volumeId === 'string' && !isValidObjectID(options.volumeId))
        throw new Error('Invalid volume ID format');

      const volumeQuery: Partial<IVolume<'server'>> = { _id: new ObjectId(options.volumeId) };
      const volume = await volumes.findOne(volumeQuery);

      if (!volume) throw new Error('Volume resource does not exist');

      query.volumeId = volume._id;
    }

    if (options.fileId !== undefined) {
      if (typeof options.fileId === 'string' && !isValidObjectID(options.fileId))
        throw new Error('Invalid file ID format');

      query._id = new ObjectId(options.fileId);
    }

    if (options.user) {
      const u = await this._users.getUser({ username: options.user });
      if (!u) throw new Error404(`User not found`);

      query.user = new ObjectId(u._id);
    }

    const fileEntries = await files.find(query).toArray();
    for (let i = 0, l = fileEntries.length; i < l; i++) await this.deleteFile(fileEntries[i] as IFileEntry<'server'>);

    return;
  }
}
