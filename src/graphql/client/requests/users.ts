import gql from '../../../utils/gql';
import { USER_FIELDS } from '../fragments/user-fields';

export const REMOVE_USER = gql`
  mutation REMOVE_USER($username: String!) {
    removeUser(username: $username)
  }
`;

export const CREATE_USER = gql`
  mutation CREATE_USER($token: AddUserInput!) {
    addUser(token: $token) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
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

export const GET_USERS = gql`
  query GET_USERS($index: Int, $limit: Int, $search: String) {
    users(index: $index, limit: $limit, search: $search) {
      count
      index
      limit
      data {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const GET_USER_AS_ADMIN = gql`
  query GET_USER_AS_ADMIN($user: String!) {
    user(user: $user) {
      ...UserFields
      registerKey
    }
  }
  ${USER_FIELDS}
`;
