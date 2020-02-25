import gql from '../../../utils/gql';

export const CATEGORY_FIELDS = gql`
  fragment CATEGORY_FIELDS on Category {
    _id
    description
    slug
    title
  }
`;
