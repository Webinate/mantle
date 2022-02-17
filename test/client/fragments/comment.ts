import gql from '../gql';

export const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    _id
    author
    content
    createdOn
    lastUpdated
    public
    post {
      _id
    }
    children {
      _id
    }
  }
`;
