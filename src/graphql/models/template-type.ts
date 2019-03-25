import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';

export const TemplateType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Template',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    defaultZone: { type: GraphQLString },
    zones: { type: new GraphQLList(GraphQLString) }
  })
});
