declare module 'modepress' {
  /*
  * The most basic response from the server. The base type of all responses.
   */
  export interface IResponse {

  }

  export interface ISimpleResponse extends IResponse {
    message: string;
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
    message: string;
    authenticated: boolean;
    user?: IUserEntry | null;
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
    message: string;
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
  export interface Page<T> {
    count: number;
    data: Array<T>;
    index: number;
    limit: number;
  }

  export namespace AuthTokens {
    /** GET /auth/authenticated */
    export namespace Authenticated { export type Body = void; export type Response = IAuthenticationResponse; }
    /** GET /auth/logout */
    export namespace Logout { export type Body = void; export type Response = ISimpleResponse; }
    /** GET /auth/activate-account */
    export namespace ActivateAccount { export type Body = void; export type Response = void; }
    /** POST /auth/login */
    export namespace Login { export type Body = ILoginToken; export type Response = IAuthenticationResponse; }
    /** POST /auth/register */
    export namespace Register { export type Body = IRegisterToken; export type Response = IAuthenticationResponse; }
    /** PUT /auth/password-reset */
    export namespace PasswordReset { export type Body = void; export type Response = ISimpleResponse; }
    /** PUT /auth/:user/approve-activation */
    export namespace ApproveActivation { export type Body = void; export type Response = ISimpleResponse; }
    /** GET /auth/:user/resend-activation */
    export namespace ResendActivation { export type Body = void; export type Response = ISimpleResponse; }
    /** GET /auth/:user/request-password-reset */
    export namespace RequestPasswordReset { export type Body = void; export type Response = ISimpleResponse; }
  }

  export namespace UserTokens {
    /** GET /users/ */
    export namespace GetAll { export type Body = void; export type Response = Page<IUserEntry>; }
    /** POST /users/ */
    export namespace Post { export type Body = IUserEntry; export type Response = IGetResponse<IUserEntry>; }
    /** GET /users/:user/meta */
    export namespace GetUserMeta { export type Body = void; export type Response = any; }
    /** GET /users/:user/meta/:name */
    export namespace GetUserMetaVal { export type Body = void; export type Response = any; }
    /** GET /users/:username */
    export namespace GetOne { export type Body = void; export type Response = IGetResponse<IUserEntry>; }
    /** DELETE /users/:username */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
    /** POST /users/:user/meta/:name */
    export namespace PostUserMeta { export type Body = any; export type Response = ISimpleResponse; }
    /** POST /users/:user/meta */
    export namespace PostUserMetaVal { export type Body = any; export type Response = ISimpleResponse; }
  }

  export namespace StatTokens {
    /** GET /stats/users/:user/get-stats */
    export namespace GetOne { export type Body = void; export type Response = IGetResponse<IStorageStats>; }
    /** POST /stats/create-stats/:target */
    export namespace Post { export type Body = void; export type Response = IStorageStats; }
    /** PUT /stats/storage-calls/:target/:value */
    export namespace PutStorageCalls { export type Body = void; export type Response = ISimpleResponse; }
    /** PUT /stats/storage-memory/:target/:value */
    export namespace PutStorageMemory { export type Body = void; export type Response = ISimpleResponse; }
    /** PUT /stats/storage-allocated-calls/:target/:value */
    export namespace PutStorageAlocCalls { export type Body = void; export type Response = ISimpleResponse; }
    /** PUT /stats/storage-allocated-memory/:target/:value */
    export namespace PutStorageAlocMemory { export type Body = void; export type Response = ISimpleResponse; }
  }

  export namespace SessionTokens {
    /** GET /sessions/ */
    export namespace GetAll { export type Body = void; export type Response = Page<ISessionEntry>; }
    /** DELETE /sessions/:id */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
  }

  export namespace PostTokens {
    /** GET /posts/ */
    export namespace GetAll { export type Body = void; export type Response = Page<IPost>; }
    /**
     * GET /posts/slug/:slug or
     * GET /posts/:id
     * */
    export namespace GetOne { export type Body = void; export type Response = IGetResponse<IPost>; }
    /** DELETE /posts/:id */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
    /** PUT /posts/:id */
    export namespace PutOne { export type Body = IPost; export type Response = ISimpleResponse; }
    /** POST /posts/ */
    export namespace Post { export type Body = IPost; export type Response = IGetResponse<IPost>; }
  }

  export namespace CommentTokens {
    /** GET /comments/ */
    export namespace GetAll { export type Body = void; export type Response = Page<IComment>; }
    /** GET /comments/:id */
    export namespace GetOne { export type Body = void; export type Response = IGetResponse<IComment>; }
    /** DELETE /comments/:id */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
    /** PUT /comments/:id */
    export namespace PutOne { export type Body = IComment; export type Response = ISimpleResponse; }
    /** POST /posts/:postId/comments/:parent? */
    export namespace Post { export type Body = IComment; export type Response = IGetResponse<IComment>; }
  }

  export namespace CategoriesTokens {
    /** GET /categories/ */
    export namespace GetAll { export type Body = void; export type Response = Page<ICategory>; }
    /** DELETE /categories/:id */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
    /** POST /categories */
    export namespace Post { export type Body = ICategory; export type Response = IGetResponse<ICategory>; }
  }

  export namespace RenderTokens {
    /** GET /renders/ */
    export namespace GetAll { export type Body = void; export type Response = Page<IRender>; }
    /** DELETE /renders/:id */
    export namespace DeleteOne { export type Body = void; export type Response = void; }
    /** DELETE /renders/clear */
    export namespace DeleteAll { export type Body = void; export type Response = ISimpleResponse; }
  }

  export namespace FileTokens {
    /** GET /files/users/:user/buckets/:bucket */
    export namespace GetAll { export type Body = void; export type Response = Page<IFileEntry>; }
    /** PUT /files/:file/rename-file */
    export namespace Put { export type Body = { name: string }; export type Response = ISimpleResponse; }
    /** DELETE /files/:files */
    export namespace DeleteAll { export type Body = void; export type Response = Page<string>; }
  }

  export namespace BucketTokens {
    /** GET /buckets/user/:user */
    export namespace GetAll { export type Body = void; export type Response = Page<IBucketEntry>; }
    /** POST /buckets/user/:user/:name */
    export namespace Post { export type Body = void; export type Response = ISimpleResponse; }
    /** POST /buckets/:bucket/upload/:parentFile? */
    export namespace PostFile { export type Body = any; export type Response = IUploadResponse; }
    /** DELETE /buckets/:buckets */
    export namespace DeleteAll { export type Body = void; export type Response = Page<string>; }
  }

  export namespace EmailTokens {
    /** POST /message-admin */
    export namespace Post { export type Body = IMessage; export type Response = boolean; }
  }
}