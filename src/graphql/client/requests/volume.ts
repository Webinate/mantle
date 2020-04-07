import gql from '../../../utils/gql';
import { VOLUME_FIELDS } from '../fragments/volume';

export const ADD_VOLUME = gql`
  mutation ADD_VOLUME($token: AddVolumeInput!) {
    addVolume(token: $token) {
      ...VolumeFields
      user {
        _id
        username
      }
    }
  }

  ${VOLUME_FIELDS}
`;

export const UPDATE_VOLUME = gql`
  mutation UPDATE_VOLUME($token: UpdateVolumeInput!) {
    updateVolume(token: $token) {
      ...VolumeFields
      user {
        _id
        username
      }
    }
  }

  ${VOLUME_FIELDS}
`;

export const GET_VOLUME = gql`
  query GET_VOLUME($id: ObjectId!) {
    volume(id: $id) {
      ...VolumeFields
      user {
        _id
        username
      }
    }
  }

  ${VOLUME_FIELDS}
`;

export const GET_VOLUMES = gql`
  query GET_VOLUMES(
    $index: Int
    $limit: Int
    $search: String
    $sortOrder: SortOrder
    $sortType: VolumeSortType
    $user: String
  ) {
    volumes(index: $index, limit: $limit, search: $search, sortOrder: $sortOrder, sortType: $sortType, user: $user) {
      count
      index
      limit
      data {
        ...VolumeFields
        user {
          _id
          username
        }
      }
    }
  }

  ${VOLUME_FIELDS}
`;

export const REMOVE_VOLUME = gql`
  mutation REMOVE_VOLUME($id: ObjectId!) {
    removeVolume(id: $id)
  }
`;
