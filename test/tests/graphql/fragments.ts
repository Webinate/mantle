import gql from '../../../src/utils/gql';

export const userFragment = gql`
  fragment UserFields on User {
    _id
    email
    lastLoggedIn
    createdOn
    password
    registerKey
    sessionId
    username
    privileges
    passwordTag
  }
`;

export const categoryFragment = gql`
  fragment CategoryFields on Category {
    _id
    title
    description
    slug
  }
`;

export const postFragment = gql`
  fragment PostFields on Post {
    _id
    slug
    title
    brief
    public
    categories
    tags
    createdOn
    lastUpdated
    author {
      _id
      email
      username
    }
    document {
      _id
      createdOn
      lastUpdated
      author {
        username
      }
      template {
        _id
        defaultZone
        description
        name
        zones
      }
      elementsOrder
      elements {
        _id
        html
        style
        type
        zone
        parent {
          _id
        }
      }
    }
    featuredImage {
      _id
    }
  }
`;

export const commentFragment = gql`
  fragment CommentFields on Comment {
    _id
    author
    content
    public
    createdOn
    lastUpdated
  }
`;

export const documentFragment = gql`
  fragment DocumentFields on Document {
    _id
    lastUpdated
    createdOn
    elementsOrder
    html
  }
`;
