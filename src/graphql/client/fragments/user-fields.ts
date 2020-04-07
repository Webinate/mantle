import gql from '../../../utils/gql';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    _id
    avatar
    avatarFile {
      _id
    }
    createdOn
    lastLoggedIn
    meta
    username
    isActivated
  }
`;
