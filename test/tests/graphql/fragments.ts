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
