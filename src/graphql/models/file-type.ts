import { ObjectType, Field, Int, ArgsType, InputType } from 'type-graphql';
import { ObjectId, ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { JsonType } from '../scalars/json';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { IFileEntry } from '../../types/models/i-file-entry';
import { Volume } from './volume-type';
import { PaginatedResponse } from './paginated-response';
import { Page } from '../../types/tokens/standard-tokens';
import { SortOrder, FileSortType } from '../../core/enums';

@ObjectType({ description: 'Object representing a File' })
export class File {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  name: string;

  @Field()
  identifier: string;

  @Field()
  publicURL: string;

  @Field()
  mimeType: string;

  @Field(type => LongType)
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

  @Field(type => File, { nullable: true })
  parentFile: File | null;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  static fromEntity(initialization: Partial<IFileEntry<'server'>>) {
    const toReturn = new File();
    Object.assign(toReturn, initialization);
    toReturn.user = User.fromEntity({ _id: initialization.user });
    toReturn.volume = Volume.fromEntity({ _id: initialization.volumeId });
    if (initialization.parentFile) {
      toReturn.parentFile = File.fromEntity({ _id: initialization.parentFile! });
    }

    return toReturn;
  }
}

@InputType()
export class UpdateFileInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  name: string;

  @Field(type => Boolean, { nullable: true })
  isPublic: boolean;

  constructor(initialization?: Partial<UpdateFileInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@ArgsType()
export class GetFilesArgs {
  constructor(initialization?: Partial<GetFilesArgs>) {
    initialization && Object.assign(this, initialization);
  }

  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit: number;

  @Field(type => String, { nullable: true })
  search: string;

  @Field(type => String, { nullable: true })
  user: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  volumeId: ObjectID;

  @Field(type => SortOrder, { defaultValue: SortOrder.asc })
  sortOrder: SortOrder;

  @Field(type => FileSortType, { defaultValue: FileSortType.created })
  sortType: FileSortType;
}

@ObjectType({ description: 'A page of wrapper of files' })
export class PaginatedFilesResponse extends PaginatedResponse(File) {
  static fromEntity(page: Page<IFileEntry<'server'>>) {
    const toReturn = new PaginatedFilesResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(file => File.fromEntity(file));
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
