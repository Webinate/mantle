import * as _Controller from './controllers/controller';
import * as _Models from './models/model';
import * as _UsersService from './users-service';
import * as _SchemaFactory from './models/schema-items/schema-item-factory';
import * as _EventManager from './event-manager';
import * as _PermissionController from './permission-controllers';
import { Utils } from './utils';

export const Controller = _Controller.Controller;
export const Model = _Models.Model;
export const UsersService = _UsersService.UsersService;
export const SchemaFactory = _SchemaFactory;
export const NumberType = _SchemaFactory.NumberType;
export const EventManager = _EventManager.EventManager;

export const isAdmin = _PermissionController.isAdmin;
export const isAuthenticated = _PermissionController.isAuthenticated;
export const getUser = _PermissionController.getUser;
export const canEdit = _PermissionController.canEdit;

export const isValidID = Utils.isValidObjectID;