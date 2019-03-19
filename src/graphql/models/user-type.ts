import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType } from 'graphql';
import { LongType } from '../scalars/long';
import { FileType } from './file-type';
import Controllers from '../../core/controller-factory';
import { IUserEntry } from '../../types/models/i-user-entry';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    passwordTag: { type: GraphQLString },
    registerKey: { type: GraphQLString },
    avatar: { type: GraphQLString },
    avatarFile: {
      type: FileType,

      resolve(parent: IUserEntry<'client'>, args) {
        if (parent.avatarFile) return Controllers.get('files').getFile(parent.avatarFile as string);
        return null;
      }
    },
    privileges: {
      type: new GraphQLEnumType({
        name: 'User_Priviledges',
        values: {
          super: { value: 'super' },
          admin: { value: 'admin' },
          regular: { value: 'regular' }
        }
      })
    },
    sessionId: { type: GraphQLString },
    createdOn: { type: LongType },
    lastLoggedIn: { type: LongType },
    author: { type: FileType }
  })
});
