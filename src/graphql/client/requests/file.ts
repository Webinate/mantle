import gql from '../../../utils/gql';

export const REMOVE_FILE = gql`
  mutation REMOVE_FILE($id: ObjectId!, $volumeId: ObjectId) {
    removeFile(id: $id, volumeId: $volumeId)
  }
`;
