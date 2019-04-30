import { GraphQLScalarType } from 'graphql';
import { ObjectID } from 'mongodb';

const parseObjectId = (id: any) => {
  if (ObjectID.isValid(id)) {
    return id;
  }

  throw new Error('ObjectId must be a single String of 24 hex characters');
};

export const GraphQLObjectId = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'The `ObjectId` scalar type represents a mongodb unique ID',
  serialize: String,
  parseValue: parseObjectId,
  parseLiteral: function parseLiteral(ast: any) {
    return parseObjectId(ast.value);
  }
});
