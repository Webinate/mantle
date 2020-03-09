import gql from '../../../utils/gql';
import { USER_FIELDS } from '../fragments/user-fields';

export const AUTHENTICATED = gql`
  query AUTHENTICATED {
    authenticated {
      authenticated
      message
      user {
        ...UserFields
      }
    }
  }

  ${USER_FIELDS}
`;

export const LOGIN = gql`
  mutation LOGIN($token: LoginInput!) {
    login(token: $token) {
      authenticated
      message
      user {
        ...UserFields
      }
    }
  }

  ${USER_FIELDS}
`;

export const LOGOUT = gql`
  mutation LOGOUT {
    logout
  }
`;
