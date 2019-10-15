import gql from '../../../../src/utils/gql';
import { userFragment } from '../fragments';

export const GET_USER = gql`
  query getUser($username: String) {
    getUser(username: $username) {
      ...UserFields
    }
  }

  ${userFragment}
`;

export const GET_USERS = gql`
  query getUsers($search: String, $index: Int, $limit: Int) {
    getUsers(search: $search, index: $index, limit: $limit) {
      count
      index
      data {
        ...UserFields
      }
    }
  }

  ${userFragment}
`;

export const CREATE_USER = gql`
  mutation createUser($username: String!, $email: String!, $password: String!, $privileges: UserPriviledgeEnumType) {
    createUser(username: $username, email: $email, password: $password, privileges: $privileges) {
      ...UserFields
    }
  }

  ${userFragment}
`;

export const REMOVE_USER = gql`
  mutation removeUser($username: String!) {
    removeUser(username: $username)
  }
`;
