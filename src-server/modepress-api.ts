import * as _Controller from "./lib/controllers/controller";
import * as _Models from "./lib/models/model";
import * as _Schema from "./lib/models/schema";
import * as _UsersService from "./lib/users-service";
import * as _SchemaFactory from "./lib/models/schema-items/schema-item-factory";
import * as _EventManager from "./lib/event-manager";
import * as _PermissionController from "./lib/permission-controllers";
import {Utils} from "./lib/utils";

export var Controller = _Controller.Controller;
export var Model = _Models.Model;
export var UsersService = _UsersService.UsersService;
export var SchemaFactory = _SchemaFactory;
export var NumberType = _SchemaFactory.NumberType;
export var EventManager = _EventManager.EventManager;
export var UserEventType = _EventManager.UserEventType;

export var isAdmin = _PermissionController.isAdmin;
export var isAuthenticated = _PermissionController.isAuthenticated;
export var getUser = _PermissionController.getUser;
export var canEdit = _PermissionController.canEdit;

export var isValidID = Utils.isValidObjectID;