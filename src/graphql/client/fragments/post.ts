import gql from '../../../utils/gql';
import { DOCUMENT_FIELDS } from './document';

export const ELEMENT_FIELDS = gql`
  fragment ElementFields on Element {
    _id
    html
    style
    type
    zone
    image {
      _id
      publicURL
    }
  }
`;

export const POST_FIELDS = gql`
  fragment PostFields on Post {
    _id
    brief
    categories {
      _id
    }
    author {
      _id
      avatar
      avatarFile {
        _id
        publicURL
      }
      username
    }
    createdOn
    lastUpdated
    latestDraft {
      _id
      createdOn
      html
    }
    document {
      ...DocumentFields
    }
  }

  ${DOCUMENT_FIELDS}
`;
