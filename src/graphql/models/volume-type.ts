import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';
import { LongType } from '../scalars/long';
import { UserType } from './user-type';
import { IVolume } from '../../types/models/i-volume-entry';
import Controllers from '../../core/controller-factory';
import { JsonType } from '../scalars/json';
import { GraphQLObjectId } from '../scalars/object-id';

export const VolumeTypeEnum = new GraphQLEnumType({
  name: 'VolumeType',
  values: {
    google: { value: 'google' },
    local: { value: 'local' }
  }
});

export const VolumeType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Volume',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: (parent: IVolume<'client'>) => {
        if (!parent.user) return null;
        if (typeof parent.user === 'string')
          return Controllers.get('users').getUser({ id: parent.user, expandForeignKeys: false });
        return parent.user;
      }
    },
    type: { type: VolumeTypeEnum },
    identifier: { type: GraphQLString },
    created: { type: LongType },
    memoryUsed: { type: LongType },
    memoryAllocated: { type: LongType },
    meta: {
      type: JsonType
    }
  })
});

export const VolumeUpdateType = new GraphQLInputObjectType({
  name: 'VolumeUpdate',
  description: 'Volume update payload',
  fields: () => ({
    ...VolumeType.getFields(),
    _id: {
      type: GraphQLObjectId
    },
    user: {
      type: GraphQLString
    }
  })
});
