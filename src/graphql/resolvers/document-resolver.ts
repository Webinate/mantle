import { Resolver, Authorized, Arg, Ctx, ResolverInterface, FieldResolver, Root, Query } from 'type-graphql';
import { Document } from '../models/document-type';
import { UserPrivilege } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from '../models/user-type';
import { Template } from '../models/template-type';
import { Element } from '../models/element-type';

@Resolver(of => Document)
export class DocumentResolver implements ResolverInterface<Document> {
  @Authorized<UserPrivilege>([UserPrivilege.admin])
  @Query(returns => Document)
  async document(@Arg('id', () => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const checkPermissions = ctx.isAdmin ? undefined : { userId: ctx.user!._id };
    const document = await ControllerFactory.get('documents').get({
      id: id,
      checkPermissions: checkPermissions
    });

    if (!document) return null;
    return Document.fromEntity(document);
  }

  @FieldResolver(type => User, { nullable: true })
  async author(@Root() root: Document) {
    const document = await ControllerFactory.get('documents').get({ id: root._id });
    const author = await ControllerFactory.get('users').getUser({ id: document!.author! });
    return User.fromEntity(author!);
  }

  @FieldResolver(type => Template)
  async template(@Root() root: Document) {
    const document = await ControllerFactory.get('documents').get({ id: root._id });
    const template = await ControllerFactory.get('templates').get(document!.template);
    return Template.fromEntity(template!);
  }

  @FieldResolver(type => [Element])
  async elements(@Root() root: Document) {
    const elements = await ControllerFactory.get('documents').getElements(root._id);
    return elements.map(e => Element.fromEntity(e));
  }
}

// import { Resolver, Authorized, Mutation, Arg, Ctx } from 'type-graphql';
// import { Document } from '../models/document-type';
// import { UserPrivilege } from '../../core/enums';
// import ControllerFactory from '../../core/controller-factory';
// import { GraphQLObjectId } from '../scalars/object-id';
// import { ObjectID } from 'mongodb';
// import { IGQLContext } from '../../types/interfaces/i-gql-context';

// @Resolver(of => Document)
// export class DocumentResolver {
//   @Authorized<UserPrivilege>([UserPrivilege.regular])
//   @Mutation(returns => Boolean)
//   async removeFile(
//     @Arg('id', type => GraphQLObjectId) id: ObjectID,
//     @Arg('volumeId', type => GraphQLObjectId, { nullable: true }) volumeId: ObjectID,
//     @Ctx() ctx: IGQLContext
//   ) {
//     await ControllerFactory.get('files').removeFiles({
//       fileId: id,
//       volumeId: volumeId,
//       user: ctx.isAdmin ? undefined : (ctx.user!.username as string)
//     });

//     return true;
//   }
// }
