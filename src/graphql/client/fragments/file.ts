import gql from '../../../utils/gql';

export const FILE_FIELDS = gql`
  fragment FileFields on File {
    _id
    created
    identifier
    isPublic
    meta
    volume {
      _id
      name
    }
    mimeType
    name
    numDownloads
    publicURL
    size
    user {
      _id
      username
    }
  }
`;
