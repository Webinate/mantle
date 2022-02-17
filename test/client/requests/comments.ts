import gql from '../gql';
import { COMMENT_FIELDS } from '../fragments/comment';

export const REMOVE_COMMENT = gql`
  mutation REMOVE_COMMENT($id: ObjectId!) {
    removeComment(id: $id)
  }
`;

export const ADD_COMMENT = gql`
  mutation ADD_COMMENT($token: AddCommentInput!) {
    addComment(token: $token) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

export const GET_COMMENT = gql`
  query GET_COMMENT($id: ObjectId!) {
    comment(id: $id) {
      ...CommentFields
    }
  }

  ${COMMENT_FIELDS}
`;

export const GET_COMMENTS = gql`
  query GET_COMMENTS(
    $index: Int
    $keyword: String
    $limit: Int
    $parentId: ObjectId
    $postId: ObjectId
    $root: Boolean
    $sortOrder: SortOrder
    $sortType: CommentSortType
    $user: String
    $visibility: CommentVisibility
  ) {
    comments(
      index: $index
      keyword: $keyword
      limit: $limit
      parentId: $parentId
      postId: $postId
      root: $root
      sortOrder: $sortOrder
      sortType: $sortType
      user: $user
      visibility: $visibility
    ) {
      count
      index
      limit
      data {
        ...CommentFields
      }
    }
  }

  ${COMMENT_FIELDS}
`;
