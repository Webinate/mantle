import { IUserEntry } from '../models/i-user-entry';
import { IPost } from '../models/i-post';
import { IComment } from '../models/i-comment';
import { IBucketEntry } from '../models/i-bucket-entry';
import { ICategory } from '../models/i-category';
import { IFileEntry } from '../models/i-file-entry';
import { IMailer } from '../models/i-mail';
import { IRender } from '../models/i-render';
import { IStorageStats } from '../models/i-storage-stats';
import { ISessionEntry } from '../models/i-session-entry';
import { IUploadToken } from './i-upload-token';
import { IServer } from '../config/i-server';

/*
* The most basic response from the server. The base type of all responses.
*/
export interface IResponse {
    message: string;
    error: boolean;
}

/*
* A response for when bulk items are deleted
*/
export interface IRemoveResponse extends IResponse {
    itemsRemoved: Array<{ id: string; error: boolean; errorMsg: string; }>;
}

/*
* A GET request that returns the status of a user's authentication
*/
export interface IAuthenticationResponse extends IResponse {
    authenticated: boolean;
    user?: IUserEntry;
}

/*
* A POST request that returns the details of a text upload
*/
export interface IUploadTextResponse extends IResponse {
    token: IUploadToken;
}

/*
* A POST request that returns the details of a binary upload
*/
export interface IUploadBinaryResponse extends IResponse {
    token: IUploadToken;
}

/*
* A POST request that returns the details of a multipart form upload
*/
export interface IUploadResponse extends IResponse {
    tokens: Array<IUploadToken>
}

/*
* A GET request that returns a data item
*/
export interface IGetResponse<T> extends IResponse {
    data: T;
}

/*
* A GET request that returns an array of data items
*/
export interface IGetArrayResponse<T> extends IResponse {
    count: number;
    data: Array<T>;
}

export interface IGetRenders extends IGetArrayResponse<IRender> { }
export interface IGetPosts extends IGetArrayResponse<IPost> { }
export interface IGetComments extends IGetArrayResponse<IComment> { }
export interface IGetPost extends IGetResponse<IPost> { }
export interface IGetComment extends IGetResponse<IComment> { }
export interface IGetCategory extends IGetResponse<ICategory> { }
export interface IGetCategories extends IGetArrayResponse<ICategory> { }
export interface IGetUser extends IGetResponse<IUserEntry> { }
export interface IGetUserStorageData extends IGetResponse<IStorageStats> { }
export interface IGetUsers extends IGetArrayResponse<IUserEntry> { count: number; }
export interface IGetSessions extends IGetArrayResponse<ISessionEntry> { }
export interface IGetBuckets extends IGetArrayResponse<IBucketEntry> { }
export interface IGetFile extends IGetResponse<IFileEntry> { }
export interface IGetFiles extends IGetArrayResponse<IFileEntry> { }
export interface IRemoveFiles extends IGetArrayResponse<string> { }
