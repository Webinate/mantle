import gql from '../../../utils/gql';
import { POST_FIELDS } from '../fragments/post';

export const ADD_POST = gql`
  mutation ADD_POST($token: AddPostInput!) {
    createPost(token: $token) {
      ...PostFields
    }
  }

  ${POST_FIELDS}
`;

export const REMOVE_POST = gql`
  mutation REMOVE_POST($id: ObjectId!) {
    removePost(id: $id)
  }
`;
