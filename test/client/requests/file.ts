import gql from '../gql';
import { FILE_FIELDS } from '../fragments/file';

export const UPDATE_FILE = gql`
  mutation UPDATE_FILE($token: UpdateFileInput!) {
    patchFile(token: $token) {
      ...FileFields
    }
  }

  ${FILE_FIELDS}
`;

export const REMOVE_FILE = gql`
  mutation REMOVE_FILE($id: ObjectId!, $volumeId: ObjectId) {
    removeFile(id: $id, volumeId: $volumeId)
  }
`;

export const GET_FILE = gql`
  query GET_FILE($id: ObjectId!) {
    file(id: $id) {
      ...FileFields
    }
  }

  ${FILE_FIELDS}
`;

export const GET_FILES = gql`
  query GET_FILES(
    $index: Int
    $limit: Int
    $search: String
    $sortOrder: SortOrder
    $sortType: FileSortType
    $user: String
    $volumeId: ObjectId
  ) {
    files(
      index: $index
      limit: $limit
      search: $search
      sortOrder: $sortOrder
      sortType: $sortType
      user: $user
      volumeId: $volumeId
    ) {
      data {
        ...FileFields
      }
      count
      index
      limit
    }
  }
  ${FILE_FIELDS}
`;
