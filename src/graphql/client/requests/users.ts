import gql from '../../../utils/gql';
import { USER_FIELDS } from '../fragments/user-fields';

export const REMOVE_USER = gql`
  mutation REMOVE_USER($username: String!) {
    removeUser(username: $username)
  }
`;

export const ADD_USER = gql`
  mutation ADD_USER($token: AddUserInput!) {
    addUser(token: $token) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const GET_USER = gql`
  query GET_USER($user: String!) {
    user(user: $user) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;
