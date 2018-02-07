import { IUserEntry } from '../models/i-user-entry';
import { IStorageStats } from '../models/i-storage-stats';
import { ICategory } from '../models/i-category';
import { IComment } from '../models/i-comment';
import { IPost } from '../models/i-post';
import { ISessionEntry } from '../models/i-session-entry';
import { IFileEntry } from '../models/i-file-entry';
import { IBucketEntry } from '../models/i-bucket-entry';
import { IRender } from '../models/i-render';
import { IMessage } from './i-message';
import { IUploadToken } from './i-upload-token';
import { ILoginToken } from './i-login-token';
import { IRegisterToken } from './i-register-token';
export interface IResponse {
}
export interface ISimpleResponse extends IResponse {
    message: string;
}
export interface IRemoveResponse extends IResponse {
    itemsRemoved: Array<{
        id: string;
        error: boolean;
        errorMsg: string;
    }>;
}
export interface IAuthenticationResponse extends IResponse {
    message: string;
    authenticated: boolean;
    user?: IUserEntry | null;
}
export interface IUploadTextResponse extends IResponse {
    token: IUploadToken;
}
export interface IUploadBinaryResponse extends IResponse {
    token: IUploadToken;
}
export interface IUploadResponse extends IResponse {
    message: string;
    tokens: Array<IUploadToken>;
}
export interface Page<T> {
    count: number;
    data: Array<T>;
    index: number;
    limit: number;
}
export declare namespace AuthTokens {
    /** GET /auth/authenticated */
    namespace Authenticated {
        type Body = void;
        type Response = IAuthenticationResponse;
    }
    /** GET /auth/logout */
    namespace Logout {
        type Body = void;
        type Response = void;
    }
    /** GET /auth/activate-account */
    namespace ActivateAccount {
        type Body = void;
        type Response = void;
    }
    /** POST /auth/login */
    namespace Login {
        type Body = ILoginToken;
        type Response = IAuthenticationResponse;
    }
    /** POST /auth/register */
    namespace Register {
        type Body = IRegisterToken;
        type Response = IAuthenticationResponse;
    }
    /** PUT /auth/password-reset */
    namespace PasswordReset {
        type Body = void;
        type Response = ISimpleResponse;
    }
    /** PUT /auth/:user/approve-activation */
    namespace ApproveActivation {
        type Body = void;
        type Response = ISimpleResponse;
    }
    /** GET /auth/:user/resend-activation */
    namespace ResendActivation {
        type Body = void;
        type Response = ISimpleResponse;
    }
    /** GET /auth/:user/request-password-reset */
    namespace RequestPasswordReset {
        type Body = void;
        type Response = ISimpleResponse;
    }
}
export declare namespace UserTokens {
    /** GET /users/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<IUserEntry>;
    }
    /** POST /users/ */
    namespace Post {
        type Body = IUserEntry;
        type Response = IUserEntry;
    }
    /** GET /users/:user/meta */
    namespace GetUserMeta {
        type Body = void;
        type Response = any;
    }
    /** GET /users/:user/meta/:name */
    namespace GetUserMetaVal {
        type Body = void;
        type Response = any;
    }
    /** GET /users/:username */
    namespace GetOne {
        type Body = void;
        type Response = IUserEntry;
    }
    /** DELETE /users/:username */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
    /** POST /users/:user/meta/:name */
    namespace PostUserMeta {
        type Body = any;
        type Response = void;
    }
    /** POST /users/:user/meta */
    namespace PostUserMetaVal {
        type Body = any;
        type Response = void;
    }
}
export declare namespace StatTokens {
    /** GET /stats/users/:user/get-stats */
    namespace GetOne {
        type Body = void;
        type Response = IStorageStats;
    }
    /** POST /stats/create-stats/:target */
    namespace Post {
        type Body = void;
        type Response = IStorageStats;
    }
    /** PUT /stats/storage-calls/:target/:value */
    namespace PutStorageCalls {
        type Body = void;
        type Response = void;
    }
    /** PUT /stats/storage-memory/:target/:value */
    namespace PutStorageMemory {
        type Body = void;
        type Response = void;
    }
    /** PUT /stats/storage-allocated-calls/:target/:value */
    namespace PutStorageAlocCalls {
        type Body = void;
        type Response = void;
    }
    /** PUT /stats/storage-allocated-memory/:target/:value */
    namespace PutStorageAlocMemory {
        type Body = void;
        type Response = void;
    }
}
export declare namespace SessionTokens {
    /** GET /sessions/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<ISessionEntry>;
    }
    /** DELETE /sessions/:id */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
}
export declare namespace PostTokens {
    /** GET /posts/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<IPost>;
    }
    /**
     * GET /posts/slug/:slug or
     * GET /posts/:id
     * */
    namespace GetOne {
        type Body = void;
        type Response = IPost;
    }
    /** DELETE /posts/:id */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
    /** PUT /posts/:id */
    namespace PutOne {
        type Body = IPost;
        type Response = IPost;
    }
    /** POST /posts/ */
    namespace Post {
        type Body = IPost;
        type Response = IPost;
    }
}
export declare namespace CommentTokens {
    /** GET /comments/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<IComment>;
    }
    /** GET /comments/:id */
    namespace GetOne {
        type Body = void;
        type Response = IComment;
    }
    /** DELETE /comments/:id */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
    /** PUT /comments/:id */
    namespace PutOne {
        type Body = IComment;
        type Response = IComment;
    }
    /** POST /posts/:postId/comments/:parent? */
    namespace Post {
        type Body = IComment;
        type Response = IComment;
    }
}
export declare namespace CategoriesTokens {
    /** GET /categories/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<ICategory>;
    }
    /** DELETE /categories/:id */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
    /** POST /categories */
    namespace Post {
        type Body = ICategory;
        type Response = ICategory;
    }
}
export declare namespace RenderTokens {
    /** GET /renders/ */
    namespace GetAll {
        type Body = void;
        type Response = Page<IRender>;
    }
    /** DELETE /renders/:id */
    namespace DeleteOne {
        type Body = void;
        type Response = void;
    }
    /** DELETE /renders/clear */
    namespace DeleteAll {
        type Body = void;
        type Response = void;
    }
}
export declare namespace FileTokens {
    /** GET /files/users/:user/buckets/:bucket */
    namespace GetAll {
        type Body = void;
        type Response = Page<IFileEntry>;
    }
    /** PUT /files/:file/rename-file */
    namespace Put {
        type Body = {
            name: string;
        };
        type Response = Partial<IFileEntry>;
    }
    /** DELETE /files/:file */
    namespace DeleteAll {
        type Body = void;
        type Response = void;
    }
}
export declare namespace BucketTokens {
    /** GET /buckets/user/:user */
    namespace GetAll {
        type Body = void;
        type Response = Page<IBucketEntry>;
    }
    /** POST /buckets/user/:user/:name */
    namespace Post {
        type Body = void;
        type Response = IBucketEntry;
    }
    /** POST /buckets/:bucket/upload/:parentFile? */
    namespace PostFile {
        type Body = any;
        type Response = IUploadResponse;
    }
    /** DELETE /buckets/:buckets */
    namespace DeleteAll {
        type Body = void;
        type Response = void;
    }
}
export declare namespace EmailTokens {
    /** POST /message-admin */
    namespace Post {
        type Body = IMessage;
        type Response = boolean;
    }
}
