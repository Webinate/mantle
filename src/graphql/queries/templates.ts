import { GraphQLFieldConfigMap, GraphQLList, GraphQLObjectType, GraphQLInt } from 'graphql';
import ControllerFactory from '../../core/controller-factory';
import { TemplateType } from '../models/template-type';

export const templateQuery: GraphQLFieldConfigMap<any, any> = {
  templates: {
    type: new GraphQLObjectType({
      name: 'TemplatesPage',
      fields: {
        data: { type: new GraphQLList(TemplateType) },
        limit: { type: GraphQLInt },
        index: { type: GraphQLInt },
        count: { type: GraphQLInt }
      }
    }),
    resolve: (parent, args) => ControllerFactory.get('templates').getMany()
  }
};
