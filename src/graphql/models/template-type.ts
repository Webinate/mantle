import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { ITemplate, Page } from '../../types';
import { PaginatedResponse } from './paginated-response';

@ObjectType({ description: 'Object representing a Template' })
export class Template {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  defaultZone: string;

  @Field(type => [String])
  zones: string[];

  static fromEntity(template: ITemplate<'server'>) {
    const toReturn = new Template();
    Object.assign(toReturn, template);
    return toReturn;
  }
}

@ObjectType({ description: 'A page of wrapper of templates' })
export class PaginatedTemplateResponse extends PaginatedResponse(Template) {
  static fromEntity(page: Page<ITemplate<'server'>>) {
    const toReturn = new PaginatedTemplateResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(template => Template.fromEntity(template));
    return toReturn;
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';

// export const TemplateType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Template',
//   fields: () => ({
//     _id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     description: { type: GraphQLString },
//     defaultZone: { type: GraphQLString },
//     zones: { type: new GraphQLList(GraphQLString) }
//   })
// });
