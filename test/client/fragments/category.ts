import gql from '../gql';

export const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    _id
    description
    slug
    title
  }
`;
