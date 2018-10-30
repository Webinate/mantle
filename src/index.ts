import * as _Controller from './serializers/serializer';
import ControllerFactory from './core/controller-factory';
import { UsersController } from './controllers/users';
import { VolumesController } from './controllers/volumes';
import { PostsController } from './controllers/posts';
import * as _Models from './models/model';
import * as _SchemaFactory from './models/schema-items/schema-item-factory';
import { isValidObjectID } from './utils/utils';
import { AdminSerializer } from './serializers/admin-serializer';
import { VolumeSerializer } from './serializers/volume-serializer';
import { CommentsSerializer } from './serializers/comments-serializer';
import { CORSSerializer } from './serializers/cors-serializer';
import { EmailsSerializer } from './serializers/emails-serializer';
import { ErrorSerializer } from './serializers/error-serializer';
import { FileSerializer } from './serializers/file-serializer';
import { PageSerializer } from './serializers/page-serializer';
import { PostsSerializer } from './serializers/posts-serializer';
import { CategoriesSerializer } from './serializers/categories-serializer';
import { TemplatesSerializer } from './serializers/templates-serializer';
import { DocumentsSerializer } from './serializers/documents-serializer';
import { SessionSerializer } from './serializers/session-serializer';
import { UserSerializer } from './serializers/user-serializer';
import { AuthSerializer } from './serializers/auth-serializer';
import { FilesController } from './controllers/files';
import { CommentsController } from './controllers/comments';
import { SessionsController } from './controllers/sessions';
import { CategoriesController } from './controllers/categories';

import { validId } from './decorators/path-sanity';
import { j200 } from './decorators/responses';
import { admin, hasPermission, authorize, identify } from './decorators/permissions';

export const Controller = _Controller.Serializer;
export const Model = _Models.Model;
export const SchemaFactory = _SchemaFactory;
export const isValidID = isValidObjectID;
export const decorators = { validId, j200, admin, hasPermission, authorize, identify };

export const controllers = {
  users: ControllerFactory.get( 'users' ) as UsersController,
  volumes: ControllerFactory.get( 'volumes' ) as VolumesController,
  posts: ControllerFactory.get( 'posts' ) as PostsController,
  categories: ControllerFactory.get( 'categories' ) as CategoriesController,
  comments: ControllerFactory.get( 'comments' ) as CommentsController,
  files: ControllerFactory.get( 'files' ) as FilesController,
  sessions: ControllerFactory.get( 'sessions' ) as SessionsController
};

export const serializers = {
  /** Endpoints for administritive tasks */
  admin: AdminSerializer,
  /** Endpoints for authenticating users */
  auth: AuthSerializer,
  /** Endpoints for managing posts */
  posts: PostsSerializer,
  /** Endpoints for managing categories */
  categories: CategoriesSerializer,
  /** Endpoints for managing templates */
  templates: TemplatesSerializer,
  /** Endpoints for managing documents */
  documents: DocumentsSerializer,
  /** Endpoints for managing comments of posts */
  comments: CommentsSerializer,
  /** Endpoints for managing cross origin allowances */
  cors: CORSSerializer,
  /** TODO: This must be removed in favour of the admin controller */
  email: EmailsSerializer,
  /** Can be used to catch and return errors */
  error: ErrorSerializer,
  /** Endpoints for managing user files */
  file: FileSerializer,
  /** Endpoints for managing user volumes */
  volume: VolumeSerializer,
  /** Endpoints for managing page renders */
  renderer: PageSerializer,
  /** Endpoints for managing active sessions */
  session: SessionSerializer,
  /** Endpoints for managing users */
  user: UserSerializer
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
export { IDraftElement } from './types/models/i-draft-elements';
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