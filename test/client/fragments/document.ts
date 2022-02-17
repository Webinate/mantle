import gql from '../gql';

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on Document {
    _id
    createdOn
    lastUpdated
    elementsOrder
    html
    author {
      _id
      username
    }
    template {
      _id
      defaultZone
      description
      name
      zones
    }
    elements {
      _id
      html
      style
      type
      zone
      parent
      image {
        _id
        publicURL
      }
    }
  }
`;
