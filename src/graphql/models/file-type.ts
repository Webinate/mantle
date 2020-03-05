import { ObjectType, Field, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { JsonType } from '../scalars/json';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { IFileEntry } from '../../types/models/i-file-entry';
import { Volume } from './volume-type';

@ObjectType({ description: 'Object representing a File' })
export class File {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field()
  name: string;

  @Field()
  identifier: string;

  @Field()
  publicURL: string;

  @Field()
  mimeType: string;

  @Field(type => Int)
  created: number;

  @Field(type => LongType)
  size: number;

  @Field(type => Int)
  numDownloads: number;

  @Field(type => Boolean)
  isPublic: boolean;

  @Field(type => User)
  user: User;

  @Field(type => Volume)
  volume: Volume;

  @Field(type => File)
  parentFile: File;

  @Field(type => JsonType)
  meta: any;

  static fromEntity(category: IFileEntry<'server'>) {
    const toReturn = new File();
    Object.assign(toReturn, category);
    return toReturn;
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from 'graphql';
// import { LongType } from '../scalars/long';
// import { UserType } from './user-type';
// import { IFileEntry } from '../../types/models/i-file-entry';
// import Controllers from '../../core/controller-factory';

// export const FileType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'File',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     user: {
//       type: UserType,
//       resolve: (parent: IFileEntry<'client'>) => {
//         if (typeof parent.user === 'string')
//           return Controllers.get('users').getUser({ id: parent.user as string, expandForeignKeys: false });
//         else return parent.user;
//       }
//     },
//     identifier: { type: GraphQLString },
//     volumeId: { type: GraphQLString },
//     volumeName: { type: GraphQLString },
//     publicURL: { type: GraphQLString },
//     mimeType: { type: GraphQLString },
//     isPublic: { type: GraphQLBoolean },
//     created: { type: LongType },
//     size: { type: LongType },
//     numDownloads: { type: LongType },
//     parentFile: {
//       type: FileType,
//       resolve: (parent: IFileEntry<'client'>) => {
//         if (!parent.parentFile) return null;

//         return Controllers.get('files').getFile(parent.parentFile as string, {
//           verbose: true,
//           expandForeignKeys: false
//         });
//       }
//     }
//   })
// });
