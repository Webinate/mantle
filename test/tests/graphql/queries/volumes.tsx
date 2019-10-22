import gql from '../../../../src/utils/gql';
import { volumeFragment } from '../fragments';

export const GET_VOLUME = gql`
  query getVolume($id: ObjectId!) {
    getVolume(id: $id) {
      ...VolumeFields
    }
  }

  ${volumeFragment}
`;

export const GET_VOLUMES = gql`
  query getVolumes(
    $index: Int
    $limit: Int
    $search: String
    $sort: VolumeSortTypeEnum
    $sortOrder: SortOrderEnumType
    $user: String
  ) {
    getVolumes(index: $index, limit: $limit, search: $search, sort: $sort, sortOrder: $sortOrder, user: $user) {
      count
      index
      limit
      data {
        ...VolumeFields
      }
    }
  }

  ${volumeFragment}
`;

export const CREATE_VOLUME = gql`
  mutation createVolume($token: VolumeUpdate) {
    createVolume(token: $token) {
      ...VolumeFields
    }
  }

  ${volumeFragment}
`;

export const REMOVE_VOLUME = gql`
  mutation removeVolume($id: ObjectId!) {
    removeVolume(id: $id)
  }
`;

export const UPDATE_VOLUME = gql`
  mutation updateVolume($id: ObjectId!, $token: VolumeUpdate!) {
    updateVolume(id: $id, token: $token) {
      ...VolumeFields
    }
  }

  ${volumeFragment}
`;
