import gql from '../../../utils/gql';

export const TEMPLATE_FIELDS = gql`
  fragment TemplateFields on Template {
    _id
    defaultZone
    description
    name
    zones
  }
`;
