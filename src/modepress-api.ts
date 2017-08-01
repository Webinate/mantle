import * as _Controller from './controllers/controller';
import * as users from './core/users';
import * as bucketManager from './core/bucket-manager';
import * as _Models from './models/model';
import * as _SchemaFactory from './models/schema-items/schema-item-factory';
import { isValidObjectID } from './utils/utils';
import * as permissions from './utils/permission-controllers';
import { AdminController } from './controllers/admin-controller';
import { BucketController } from './controllers/bucket-controller';
import { CommentsController } from './controllers/comments-controller';
import { CORSController } from './controllers/cors-controller';
import { EmailsController } from './controllers/emails-controller';
import { ErrorController } from './controllers/error-controller';
import { FileController } from './controllers/file-controller';
import { PageRenderer } from './controllers/page-renderer';
import { PostsController } from './controllers/posts-controller';
import { CategoriesController } from './controllers/categories-controller';
import { SessionController } from './controllers/session-controller';
import { StatsController } from './controllers/stats-controller';
import { UserController } from './controllers/user-controller';
import { AuthController } from './controllers/auth-controller';

export const Controller = _Controller.Controller;
export const Model = _Models.Model;
export const SchemaFactory = _SchemaFactory;
export const UserManager = users.UserManager;
export const BucketManager = bucketManager.BucketManager;
export const isValidID = isValidObjectID;
export const authentication = permissions;
export const controllers = {
    /** Endpoints for administritive tasks */
    admin: AdminController,
    /** Endpoints for authenticating users */
    auth: AuthController,
    /** Endpoints for managing posts */
    posts: PostsController,
    /** Endpoints for managing categories */
    categories: CategoriesController,
    /** Endpoints for managing comments of posts */
    comments: CommentsController,
    /** Endpoints for managing cross origin allowances */
    cors: CORSController,
    /** TODO: This must be removed in favour of the admin controller */
    email: EmailsController,
    /** Can be used to catch and return errors */
    error: ErrorController,
    /** Endpoints for managing user files */
    file: FileController,
    /** Endpoints for managing user buckets */
    bucket: BucketController,
    /** Endpoints for managing page renders */
    renderer: PageRenderer,
    /** Endpoints for managing active sessions */
    session: SessionController,
    /** Endpoints for managing user stats and allowances */
    stats: StatsController,
    /** Endpoints for managing users */
    user: UserController
}