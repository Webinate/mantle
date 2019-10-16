import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
import { LongType } from '../scalars/long';
import { FileType } from './file-type';
import Controllers from '../../core/controller-factory';
import { IUserEntry } from '../../types/models/i-user-entry';
import { GraphQLObjectId } from '../scalars/object-id';

export const UserPriviledgesType = new GraphQLEnumType({
  name: 'UserPriviledges',
  values: {
    super: { value: 'super' },
    admin: { value: 'admin' },
    regular: { value: 'regular' }
  }
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLObjectId },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    passwordTag: { type: GraphQLString },
    registerKey: { type: GraphQLString },
    avatar: { type: GraphQLString },
    avatarFile: {
      type: FileType,

      resolve(parent: IUserEntry<'client'>, args) {
        if (!parent.avatarFile) return null;
        if (typeof parent.avatarFile === 'string') return Controllers.get('files').getFile(parent.avatarFile);
        return parent.avatarFile;
      }
    },
    privileges: {
      type: UserPriviledgesType
    },
    sessionId: { type: GraphQLString },
    createdOn: { type: LongType },
    lastLoggedIn: { type: LongType },
    author: { type: FileType }
  })
});

export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'Input model for user data',
  fields: () => ({
    _id: {
      type: GraphQLObjectId
    },
    email: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    },
    registerKey: {
      type: GraphQLObjectId
    },
    avatar: {
      type: GraphQLString
    },
    avatarFile: {
      type: GraphQLObjectId
    },
    privileges: {
      type: UserPriviledgesType
    }
  })
});
