import gql from '../../../utils/gql';
import { CATEGORY_FIELDS } from '../fragments/category';

export const ADD_CATEGORY = gql`
  mutation ADD_CATEGORY($token: AddCategoryInput!) {
    createCategory(token: $token) {
      _id
      description
      slug
      title
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation REMOVE_CATEGORY($id: String!) {
    removeCategory(id: $id)
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UPDATE_CATEGORY($token: UpdateCategoryInput!) {
    updateCategory(token: $token) {
      _id
      description
      slug
      title
    }
  }
`;

export const GET_CATEGORY = gql`
  query GET_CATEGORY($id: String, $slug: String) {
    category(id: $id, slug: $slug) {
      ...CategoryFields
    }
  }

  ${CATEGORY_FIELDS}
`;

export const GET_CATEGORIES = gql`
  query GET_CATEGORIES($root: Boolean, $limit: Int, $index: Int) {
    categories(root: $root, limit: $limit, index: $index) {
      count
      index
      limit
      data {
        ...CategoryFields
      }
    }
  }
  ${CATEGORY_FIELDS}
`;
