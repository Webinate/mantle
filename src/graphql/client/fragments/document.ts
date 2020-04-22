import gql from '../../../utils/gql';

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on Document {
    _id
    createdOn
    lastUpdated
    elementsOrder
    html
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
      image {
        _id
        publicURL
      }
    }
  }
`;
