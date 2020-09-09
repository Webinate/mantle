import { ObjectType, Field, Int, ArgsType, InputType, Authorized } from 'type-graphql';
import { ObjectId, ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { JsonType } from '../scalars/json';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { IVolume } from '../../types/models/i-volume-entry';
import { VolumeType, SortOrder, VolumeSortType, AuthLevel } from '../../core/enums';
import { PaginatedResponse } from './paginated-response';
import { Page } from '../../types/tokens/standard-tokens';

@ObjectType({ description: 'Object representing a Volume' })
export class Volume {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  name: string;

  @Field()
  identifier: string;

  @Field(type => VolumeType)
  type: VolumeType;

  @Field(type => LongType)
  created: number;

  @Field(type => LongType)
  memoryUsed: number;

  @Field(type => LongType)
  memoryAllocated: number;

  @Field(type => User)
  user: User;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  static fromEntity(initialization: Partial<IVolume<'server'>>) {
    const toReturn = new Volume();
    Object.assign(toReturn, initialization);
    toReturn.user = User.fromEntity({ _id: initialization.user });
    return toReturn;
  }
}

@ObjectType({ description: 'A page of wrapper of volumes' })
export class PaginatedVolumeResponse extends PaginatedResponse(Volume) {
  static fromEntity(page: Page<IVolume<'server'>>) {
    const toReturn = new PaginatedVolumeResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(volume => Volume.fromEntity(volume));
    return toReturn;
  }
}

@ArgsType()
export class GetVolumesArgs {
  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit = 10;

  @Field(type => String, { defaultValue: '' })
  search = '';

  @Field(type => String, { nullable: true })
  user: string;

  @Field(type => SortOrder, { defaultValue: SortOrder.asc })
  sortOrder: SortOrder;

  @Field(type => VolumeSortType, { defaultValue: VolumeSortType.created })
  sortType: VolumeSortType;
}

@InputType()
export class AddVolumeInput {
  @Field()
  name: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  user: ObjectID;

  @Field(type => VolumeType, { nullable: true, defaultValue: VolumeType.local })
  type: VolumeType;

  @Field(type => LongType, { nullable: true })
  @Authorized<AuthLevel>([AuthLevel.admin])
  memoryAllocated: number;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  constructor(initialization?: Partial<AddVolumeInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateVolumeInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => LongType, { nullable: true })
  memoryUsed: number;

  @Field({ nullable: true })
  name: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  user: ObjectID;

  @Field(type => LongType, { nullable: true })
  @Authorized<AuthLevel>([AuthLevel.admin])
  memoryAllocated: number;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  constructor(initialization?: Partial<UpdateVolumeInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
// import { LongType } from '../scalars/long';
// import { UserType } from './user-type';
// import { IVolume } from '../../types/models/i-volume-entry';
// import Controllers from '../../core/controller-factory';
// import { JsonType } from '../scalars/json';
// import { GraphQLObjectId } from '../scalars/object-id';

// export const VolumeTypeEnum = new GraphQLEnumType({
//   name: 'VolumeType',
//   values: {
//     google: { value: 'google' },
//     local: { value: 'local' }
//   }
// });

// export const VolumeType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Volume',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     user: {
//       type: UserType,
//       resolve: (parent: IVolume<'client'>) => {
//         if (!parent.user) return null;
//         if (typeof parent.user === 'string')
//           return Controllers.get('users').getUser({ id: parent.user, expandForeignKeys: false });
//         return parent.user;
//       }
//     },
//     type: { type: VolumeTypeEnum },
//     identifier: { type: GraphQLString },
//     created: { type: LongType },
//     memoryUsed: { type: LongType },
//     memoryAllocated: { type: LongType },
//     meta: {
//       type: JsonType
//     }
//   })
// });

// export const VolumeUpdateType = new GraphQLInputObjectType({
//   name: 'VolumeUpdate',
//   description: 'Volume update payload',
//   fields: () => ({
//     ...VolumeType.getFields(),
//     _id: {
//       type: GraphQLObjectId
//     },
//     user: {
//       type: GraphQLString
//     }
//   })
// });
