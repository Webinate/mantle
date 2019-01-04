import * as _Controller from './routers/router';
import ControllerFactory from './core/controller-factory';
import { UsersController } from './controllers/users';
import { VolumesController } from './controllers/volumes';
import { PostsController } from './controllers/posts';
import * as _Models from './models/model';
import * as _SchemaFactory from './models/schema-items/schema-item-factory';
import { isValidObjectID } from './utils/utils';
import { AdminRouter } from './routers/admin';
import { VolumeRouter } from './routers/volume';
import { CommentsRouter } from './routers/comments';
import { CORSRouter } from './routers/cors';
import { EmailsRouter } from './routers/emails';
import { ErrorRouter } from './routers/error';
import { FileRouter } from './routers/file';
import { PageRouter } from './routers/page';
import { PostsRouter } from './routers/posts';
import { CategoriesRouter } from './routers/categories';
import { TemplatesRouter } from './routers/templates';
import { DocumentsRouter } from './routers/documents';
import { SessionRouter } from './routers/session';
import { UserRouter } from './routers/user';
import { AuthRouter } from './routers/auth';
import { FilesController } from './controllers/files';
import { CommentsController } from './controllers/comments';
import { SessionsController } from './controllers/sessions';
import { CategoriesController } from './controllers/categories';

import { validId } from './decorators/path-sanity';
import { blocking } from './decorators/blocking-route';
import { j200 } from './decorators/responses';
import { admin, hasPermission, authorize, identify } from './decorators/permissions';
import { TemplatesController } from './controllers/templates';
import { DocumentsController } from './controllers/documents';

export const Controller = _Controller.Router;
export const Model = _Models.Model;
export const SchemaFactory = _SchemaFactory;
export const isValidID = isValidObjectID;
export const decorators = { validId, blocking, j200, admin, hasPermission, authorize, identify };

export const controllers = {
  users: ControllerFactory.get( 'users' ) as UsersController,
  volumes: ControllerFactory.get( 'volumes' ) as VolumesController,
  posts: ControllerFactory.get( 'posts' ) as PostsController,
  categories: ControllerFactory.get( 'categories' ) as CategoriesController,
  comments: ControllerFactory.get( 'comments' ) as CommentsController,
  files: ControllerFactory.get( 'files' ) as FilesController,
  sessions: ControllerFactory.get( 'sessions' ) as SessionsController,
  templates: ControllerFactory.get( 'templates' ) as TemplatesController,
  documents: ControllerFactory.get( 'documents' ) as DocumentsController
};

export const routers = {
  /** Endpoints for administritive tasks */
  admin: AdminRouter,
  /** Endpoints for authenticating users */
  auth: AuthRouter,
  /** Endpoints for managing posts */
  posts: PostsRouter,
  /** Endpoints for managing categories */
  categories: CategoriesRouter,
  /** Endpoints for managing templates */
  templates: TemplatesRouter,
  /** Endpoints for managing documents */
  documents: DocumentsRouter,
  /** Endpoints for managing comments of posts */
  comments: CommentsRouter,
  /** Endpoints for managing cross origin allowances */
  cors: CORSRouter,
  /** TODO: This must be removed in favour of the admin controller */
  email: EmailsRouter,
  /** Can be used to catch and return errors */
  error: ErrorRouter,
  /** Endpoints for managing user files */
  file: FileRouter,
  /** Endpoints for managing user volumes */
  volume: VolumeRouter,
  /** Endpoints for managing page renders */
  renderer: PageRouter,
  /** Endpoints for managing active sessions */
  session: SessionRouter,
  /** Endpoints for managing users */
  user: UserRouter
}

export { CategoriesGetManyOptions } from './controllers/categories';
export { FilesGetOptions } from './controllers/files';
export { UsersGetAllOptions } from './controllers/users';
export { VolumesGetOptions } from './controllers/volumes';
export { CommentGetAllOptions } from './controllers/comments';
export { PostsGetAllOptions } from './controllers/posts';
export { IVolume } from './types/models/i-volume-entry';
export { ITemplate } from './types/models/i-template';
export { IDocument } from './types/models/i-document';
export { IDraft } from './types/models/i-draft';
export { IDraftElement, IImageElement } from './types/models/i-draft-elements';
export { ICategory } from './types/models/i-category';
export { IComment } from './types/models/i-comment';
export { IFileEntry } from './types/models/i-file-entry';
export { IMailer, IMailgun, IMailOptions } from './types/models/i-mail';
export { IModelEntry } from './types/models/i-model-entry';
export { IPost } from './types/models/i-post';
export { IRender } from './types/models/i-render';
export { ISessionEntry } from './types/models/i-session-entry';
export { IUserEntry } from './types/models/i-user-entry';
export { IUploadResponse } from './types/tokens/i-file-tokens';
export { DraftElements } from './types/models/i-draft-elements';

export {
  IAuthenticationResponse, EmailTokens,
  IRemoveResponse, IResponse, ISimpleResponse,
  Page
} from './types/tokens/standard-tokens';
export { IAuthReq } from './types/tokens/i-auth-request';
export { ILoginToken } from './types/tokens/i-login-token';
export { IMessage } from './types/tokens/i-message';
export { IRegisterToken } from './types/tokens/i-register-token';
export { SocketTokens } from './types/tokens/i-socket-token';
export { IClient, IServer } from './types/config/properties/i-client';
export { IConfig } from './types/config/i-config';
export { IAdminUser } from './types/config/properties/i-admin';