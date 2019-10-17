import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';
import { LongType } from '../scalars/long';
import { UserType } from './user-type';
import { IFileEntry } from '../../types/models/i-file-entry';
import Controllers from '../../core/controller-factory';

export const FileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'File',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: (parent: IFileEntry<'client'>) => {
        if (typeof parent.user === 'string')
          return Controllers.get('users').getUser({ id: parent.user as string, expandForeignKeys: false });
        else return parent.user;
      }
    },
    identifier: { type: GraphQLString },
    volumeId: { type: GraphQLString },
    volumeName: { type: GraphQLString },
    publicURL: { type: GraphQLString },
    mimeType: { type: GraphQLString },
    isPublic: { type: GraphQLBoolean },
    created: { type: LongType },
    size: { type: LongType },
    numDownloads: { type: LongType },
    parentFile: {
      type: FileType,
      resolve: (parent: IFileEntry<'client'>) => {
        if (!parent.parentFile) return null;

        return Controllers.get('files').getFile(parent.parentFile as string, {
          verbose: true,
          expandForeignKeys: false
        });
      }
    }
  })
});
