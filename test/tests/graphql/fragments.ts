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

export const postFragment = `
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

export const documentFragment = `
fragment DocumentFields on Document {
  _id
  lastUpdated
  createdOn
  elementsOrder
  html
}
`;
