import gql from '../gql';
import { POST_FIELDS } from '../fragments/post';

export const ADD_POST = gql`
  mutation ADD_POST($token: AddPostInput!) {
    createPost(token: $token) {
      ...PostFields
    }
  }

  ${POST_FIELDS}
`;

export const GET_POST_DRAFTS = gql`
  query GET_POST_DRAFTS($id: ObjectId!) {
    getPostDrafts(id: $id) {
      _id
      createdOn
      html
      parent {
        _id
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UPDATE_POST($token: UpdatePostInput!) {
    patchPost(token: $token) {
      ...PostFields
    }
  }

  ${POST_FIELDS}
`;

export const REMOVE_POST = gql`
  mutation REMOVE_POST($id: ObjectId!) {
    removePost(id: $id)
  }
`;

export const REMOVE_POST_DRAFT = gql`
  mutation REMOVE_POST_DRAFT($draftId: ObjectId!, $postId: ObjectId!) {
    removePostDraft(draftId: $draftId, postId: $postId)
  }
`;

export const GET_POST = gql`
  query GET_POST($id: ObjectId, $slug: String) {
    post(id: $id, slug: $slug) {
      ...PostFields
    }
  }

  ${POST_FIELDS}
`;

export const GET_POSTS = gql`
  query GET_POSTS(
    $author: String
    $categories: [ObjectId!]
    $index: Int
    $keyword: String
    $limit: Int
    $requiredTags: [String!]
    $sortOrder: SortOrder
    $sortType: PostSortType
    $tags: [String!]
    $visibility: PostVisibility
  ) {
    posts(
      author: $author
      categories: $categories
      index: $index
      keyword: $keyword
      limit: $limit
      requiredTags: $requiredTags
      sortOrder: $sortOrder
      sortType: $sortType
      tags: $tags
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
  ${POST_FIELDS}
`;
