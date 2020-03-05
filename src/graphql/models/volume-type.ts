import { ObjectType, Field, Int, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { JsonType } from '../scalars/json';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { IVolume } from '../../types/models/i-volume-entry';
import { VolumeType } from '../../core/enums';

registerEnumType(VolumeType, {
  name: 'VolumeType',
  description: 'The core type of volume type'
});

@ObjectType({ description: 'Object representing a Volume' })
export class Volume {
  @Field(type => GraphQLObjectId)
  _id: ObjectId;

  @Field()
  name: string;

  @Field()
  identifier: string;

  type: 'google' | 'local';

  @Field(type => Int)
  created: number;

  @Field(type => LongType)
  memoryUsed: number;

  @Field(type => LongType)
  memoryAllocated: number;

  @Field(type => User)
  user: User;

  @Field(type => JsonType)
  meta: any;

  static fromEntity(category: IVolume<'server'>) {
    const toReturn = new Volume();
    Object.assign(toReturn, category);
    return toReturn;
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
