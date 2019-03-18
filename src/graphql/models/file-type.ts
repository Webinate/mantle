import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';
import { LongType } from '../scalars/long';
import { UserType } from './user-type';

export const FileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'File',
  fields: () => ({
    _id: { type: GraphQLID },
    user: { type: UserType },
    identifier: { type: GraphQLString },
    volumeId: { type: GraphQLString },
    volumeName: { type: GraphQLString },
    publicURL: { type: GraphQLString },
    mimeType: { type: GraphQLString },
    isPublic: { type: GraphQLBoolean },
    created: { type: LongType },
    size: { type: LongType },
    numDownloads: { type: LongType },
    parentFile: { type: FileType }
    // author: {
    //     type: UserType,
    //     resolve(parent, args){
    //         return Author.findById(parent.authorId);
    //     }
    // }
  })
});
