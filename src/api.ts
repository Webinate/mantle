import * as _Controller from './serializers/serializer';
import ControllerFactory from './core/controller-factory';
import { UsersController } from './controllers/users';
import { BucketsController } from './controllers/buckets';
import { PostsController } from './controllers/posts';
import * as _Models from './models/model';
import * as _SchemaFactory from './models/schema-items/schema-item-factory';
import { isValidObjectID } from './utils/utils';
import * as permissions from './utils/permission-controllers';
import { AdminSerializer } from './serializers/admin-serializer';
import { BucketSerializer } from './serializers/bucket-serializer';
import { CommentsSerializer } from './serializers/comments-serializer';
import { CORSSerializer } from './serializers/cors-serializer';
import { EmailsSerializer } from './serializers/emails-serializer';
import { ErrorSerializer } from './serializers/error-serializer';
import { FileSerializer } from './serializers/file-serializer';
import { PageSerializer } from './serializers/page-serializer';
import { PostsSerializer } from './serializers/posts-serializer';
import { CategoriesSerializer } from './serializers/categories-serializer';
import { SessionSerializer } from './serializers/session-serializer';
import { StatsSerializer } from './serializers/stats-serializer';
import { UserSerializer } from './serializers/user-serializer';
import { AuthSerializer } from './serializers/auth-serializer';
import { FilesController } from './controllers/files';
import { StatsController } from './controllers/stats';
import { CommentsController } from './controllers/comments';
import { SessionsController } from './controllers/sessions';

export const Controller = _Controller.Serializer;
export const Model = _Models.Model;
export const SchemaFactory = _SchemaFactory;
export const isValidID = isValidObjectID;
export const authentication = permissions;

export const controllers = {
  users: ControllerFactory.get( 'users' ) as UsersController,
  buckets: ControllerFactory.get( 'buckets' ) as BucketsController,
  posts: ControllerFactory.get( 'posts' ) as PostsController,
  comments: ControllerFactory.get( 'comments' ) as CommentsController,
  files: ControllerFactory.get( 'files' ) as FilesController,
  stats: ControllerFactory.get( 'stats' ) as StatsController,
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
  /** Endpoints for managing user buckets */
  bucket: BucketSerializer,
  /** Endpoints for managing page renders */
  renderer: PageSerializer,
  /** Endpoints for managing active sessions */
  session: SessionSerializer,
  /** Endpoints for managing user stats and allowances */
  stats: StatsSerializer,
  /** Endpoints for managing users */
  user: UserSerializer
}

export { IBucketEntry } from './types/models/i-bucket-entry';
export { ICategory } from './types/models/i-category';
export { IComment } from './types/models/i-comment';
export { IFileEntry } from './types/models/i-file-entry';
export { IGMail, IMailer, IMailgun, IMailOptions } from './types/models/i-mail';
export { IModelEntry } from './types/models/i-model-entry';
export { IPost } from './types/models/i-post';
export { IRender } from './types/models/i-render';
export { ISessionEntry } from './types/models/i-session-entry';
export { IStorageStats } from './types/models/i-storage-stats';
export { IUserEntry } from './types/models/i-user-entry';
export {
  IAuthenticationResponse, AuthTokens, BucketTokens, CategoriesTokens, CommentTokens, EmailTokens,
  FileTokens, IRemoveResponse, IResponse, ISimpleResponse, IUploadBinaryResponse, IUploadResponse, IUploadTextResponse,
  Page, RenderTokens, SessionTokens, StatTokens, UserTokens
} from './types/tokens/standard-tokens';
export { IAuthReq } from './types/tokens/i-auth-request';
export { ILoginToken } from './types/tokens/i-login-token';
export { IMessage } from './types/tokens/i-message';
export { IRegisterToken } from './types/tokens/i-register-token';
export { SocketTokens } from './types/tokens/i-socket-token';
export { IUploadToken } from './types/tokens/i-upload-token';
export { IClient } from './types/config/properties/i-client';