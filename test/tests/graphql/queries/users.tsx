import gql from '../../../../src/utils/gql';
import { userFragment } from '../fragments';

export const GET_USER = gql`
  query getUser {
    getUser {
      ...UserFields
    }
  }

  ${userFragment}
`;
