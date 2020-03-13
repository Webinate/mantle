import { Resolver, Query, Arg } from 'type-graphql';
import { Template, PaginatedTemplateResponse } from '../models/template-type';
import ControllerFactory from '../../core/controller-factory';
import { ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';

@Resolver(of => Template)
export class TemplateResolver {
  @Query(returns => Template, { nullable: true })
  async template(@Arg('id', type => GraphQLObjectId, { nullable: true }) id: ObjectID) {
    const template = await ControllerFactory.get('templates').get(id);
    if (!template) return null;
    return Template.fromEntity(template);
  }

  @Query(returns => PaginatedTemplateResponse, { description: 'Gets an array of all templates' })
  async templates() {
    const response = await ControllerFactory.get('templates').getMany();
    return PaginatedTemplateResponse.fromEntity(response);
  }
}
