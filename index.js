"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _Controller = require("./lib/serializers/serializer");
const controller_factory_1 = require("./lib/core/controller-factory");
const _Models = require("./lib/models/model");
const _SchemaFactory = require("./lib/models/schema-items/schema-item-factory");
const utils_1 = require("./lib/utils/utils");
const permissions = require("./lib/utils/permission-controllers");
const admin_serializer_1 = require("./lib/serializers/admin-serializer");
const bucket_serializer_1 = require("./lib/serializers/bucket-serializer");
const comments_serializer_1 = require("./lib/serializers/comments-serializer");
const cors_serializer_1 = require("./lib/serializers/cors-serializer");
const emails_serializer_1 = require("./lib/serializers/emails-serializer");
const error_serializer_1 = require("./lib/serializers/error-serializer");
const file_serializer_1 = require("./lib/serializers/file-serializer");
const page_serializer_1 = require("./lib/serializers/page-serializer");
const posts_serializer_1 = require("./lib/serializers/posts-serializer");
const categories_serializer_1 = require("./lib/serializers/categories-serializer");
const session_serializer_1 = require("./lib/serializers/session-serializer");
const stats_serializer_1 = require("./lib/serializers/stats-serializer");
const user_serializer_1 = require("./lib/serializers/user-serializer");
const auth_serializer_1 = require("./lib/serializers/auth-serializer");
exports.Controller = _Controller.Serializer;
exports.Model = _Models.Model;
exports.SchemaFactory = _SchemaFactory;
exports.isValidID = utils_1.isValidObjectID;
exports.authentication = permissions;
exports.controllers = {
    users: controller_factory_1.default.get('users'),
    buckets: controller_factory_1.default.get('buckets'),
    posts: controller_factory_1.default.get('posts'),
    comments: controller_factory_1.default.get('comments'),
    files: controller_factory_1.default.get('files'),
    stats: controller_factory_1.default.get('stats'),
    sessions: controller_factory_1.default.get('sessions')
};
exports.serializers = {
    /** Endpoints for administritive tasks */
    admin: admin_serializer_1.AdminSerializer,
    /** Endpoints for authenticating users */
    auth: auth_serializer_1.AuthSerializer,
    /** Endpoints for managing posts */
    posts: posts_serializer_1.PostsSerializer,
    /** Endpoints for managing categories */
    categories: categories_serializer_1.CategoriesSerializer,
    /** Endpoints for managing comments of posts */
    comments: comments_serializer_1.CommentsSerializer,
    /** Endpoints for managing cross origin allowances */
    cors: cors_serializer_1.CORSSerializer,
    /** TODO: This must be removed in favour of the admin controller */
    email: emails_serializer_1.EmailsSerializer,
    /** Can be used to catch and return errors */
    error: error_serializer_1.ErrorSerializer,
    /** Endpoints for managing user files */
    file: file_serializer_1.FileSerializer,
    /** Endpoints for managing user buckets */
    bucket: bucket_serializer_1.BucketSerializer,
    /** Endpoints for managing page renders */
    renderer: page_serializer_1.PageSerializer,
    /** Endpoints for managing active sessions */
    session: session_serializer_1.SessionSerializer,
    /** Endpoints for managing user stats and allowances */
    stats: stats_serializer_1.StatsSerializer,
    /** Endpoints for managing users */
    user: user_serializer_1.UserSerializer
};
