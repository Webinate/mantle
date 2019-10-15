import gql from '../../../../src/utils/gql';
import { postFragment } from '../fragments';

export const DELETE_POST = gql`
  mutation deletePost($id: ObjectId!) {
    removePost(id: $id)
  }
`;

export const CREATE_POST = gql`
  mutation createPost($token: PostInput) {
    createPost(token: $token) {
      ...PostFields
    }
  }

  ${postFragment}
`;

export const GET_POSTS = gql`
  query getPosts(
    $index: Int
    $limit: Int
    $author: String
    $keyword: String
    $sort: PostSortTypeEnum
    $visibility: POST_VISIBILITY
    $categories: [String]
    $tags: [String]
    $requiredTags: [String]
    $sortOrder: SortOrderEnumType
  ) {
    getPosts(
      author: $author
      index: $index
      keyword: $keyword
      limit: $limit
      sort: $sort
      categories: $categories
      sortOrder: $sortOrder
      tags: $tags
      requiredTags: $requiredTags
      visibility: $visibility
    ) {
      count
      index
      limit
      data {
        ...PostFields
      }
    }
  }

  ${postFragment}
`;

export const GET_POST = gql`
  query getPost($id: ID, $slug: String) {
    getPost(id: $id, slug: $slug) {
      ...PostFields
    }
  }
  ${postFragment}
`;
