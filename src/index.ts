import * as _Controller from './lib/serializers/serializer';
import ControllerFactory from './lib/core/controller-factory';
import { UsersController } from './lib/controllers/users';
import { BucketsController } from './lib/controllers/buckets';
import { PostsController } from './lib/controllers/posts';
import * as _Models from './lib/models/model';
import * as _SchemaFactory from './lib/models/schema-items/schema-item-factory';
import { isValidObjectID } from './lib/utils/utils';
import * as permissions from './lib/utils/permission-controllers';
import { AdminSerializer } from './lib/serializers/admin-serializer';
import { BucketSerializer } from './lib/serializers/bucket-serializer';
import { CommentsSerializer } from './lib/serializers/comments-serializer';
import { CORSSerializer } from './lib/serializers/cors-serializer';
import { EmailsSerializer } from './lib/serializers/emails-serializer';
import { ErrorSerializer } from './lib/serializers/error-serializer';
import { FileSerializer } from './lib/serializers/file-serializer';
import { PageSerializer } from './lib/serializers/page-serializer';
import { PostsSerializer } from './lib/serializers/posts-serializer';
import { CategoriesSerializer } from './lib/serializers/categories-serializer';
import { SessionSerializer } from './lib/serializers/session-serializer';
import { StatsSerializer } from './lib/serializers/stats-serializer';
import { UserSerializer } from './lib/serializers/user-serializer';
import { AuthSerializer } from './lib/serializers/auth-serializer';
import { FilesController } from './lib/controllers/files';
import { StatsController } from './lib/controllers/stats';
import { CommentsController } from './lib/controllers/comments';
import { SessionsController } from './lib/controllers/sessions';

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

export { IBucketEntry } from './lib/types/models/i-bucket-entry';
export { ICategory } from './lib/types/models/i-category';
export { IComment } from './lib/types/models/i-comment';
export { IFileEntry } from './lib/types/models/i-file-entry';
export { IGMail, IMailer, IMailgun, IMailOptions } from './lib/types/models/i-mail';
export { IModelEntry } from './lib/types/models/i-model-entry';
export { IPost } from './lib/types/models/i-post';
export { IRender } from './lib/types/models/i-render';
export { ISessionEntry } from './lib/types/models/i-session-entry';
export { IStorageStats } from './lib/types/models/i-storage-stats';
export { IUserEntry } from './lib/types/models/i-user-entry';
export {
  IAuthenticationResponse, AuthTokens, BucketTokens, CategoriesTokens, CommentTokens, EmailTokens,
  FileTokens, IRemoveResponse, IResponse, ISimpleResponse, IUploadBinaryResponse, IUploadResponse, IUploadTextResponse,
  Page, RenderTokens, SessionTokens, StatTokens, UserTokens
} from './lib/types/tokens/standard-tokens';
export { IAuthReq } from './lib/types/tokens/i-auth-request';
export { ILoginToken } from './lib/types/tokens/i-login-token';
export { IMessage } from './lib/types/tokens/i-message';
export { IRegisterToken } from './lib/types/tokens/i-register-token';
export { SocketTokens } from './lib/types/tokens/i-socket-token';
export { IUploadToken } from './lib/types/tokens/i-upload-token';
export { IClient } from './lib/types/config/properties/i-client';