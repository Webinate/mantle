import * as _Controller from "./src/controllers/controller";
import * as _Models from "./src/models/model";
import * as _Schema from "./src/models/schema";
import * as _UsersService from "./src/users-service";
import * as _SchemaFactory from "./src/models/schema-items/schema-item-factory";
import * as _EventManager from "./src/event-manager";
import * as _PermissionController from "./src/permission-controllers";
import { Utils } from "./src/utils";

export var Controller = _Controller.Controller;
export var Model = _Models.Model;
export var UsersService = _UsersService.UsersService;
export var SchemaFactory = _SchemaFactory;
export var NumberType = _SchemaFactory.NumberType;
export var EventManager = _EventManager.EventManager;

export var isAdmin = _PermissionController.isAdmin;
export var isAuthenticated = _PermissionController.isAuthenticated;
export var getUser = _PermissionController.getUser;
export var canEdit = _PermissionController.canEdit;

export var isValidID = Utils.isValidObjectID;