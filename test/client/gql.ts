import gql from 'graphql-tag';

interface GqlTag {
  loc: { source: { body: string } };
}

export default function stringGqlTag(strings: any, ...expressions: any): string {
  return (gql(strings, ...expressions) as GqlTag).loc.source.body;
}
