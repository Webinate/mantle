export const userFragment = `
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

export const categoryFragment = `
fragment CategoryFields on Category {
  _id
  title
  description
  slug
}
`;

export const commentFragment = `
fragment CommentFields on Comment {
  _id
  author
  content
  public
  createdOn
  lastUpdated
}
`;
