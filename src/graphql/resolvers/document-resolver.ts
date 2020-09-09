import {
  Resolver,
  Authorized,
  Arg,
  Ctx,
  ResolverInterface,
  FieldResolver,
  Root,
  Query,
  Mutation,
  Int
} from 'type-graphql';
import { Document } from '../models/document-type';
import { AuthLevel } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { ObjectID } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from '../models/user-type';
import { Template } from '../models/template-type';
import { Element, AddElementInput, UpdateElementInput } from '../models/element-type';
import { Queue } from '../helpers/queue';
import { JsonType } from '../scalars/json';
import { IDraftElement } from '../../types/models/i-draft-elements';

const addElmQueue: Queue = new Queue();
const removeElmQueue: Queue = new Queue();

@Resolver(of => Document)
export class DocumentResolver implements ResolverInterface<Document> {
  @Authorized<AuthLevel>([AuthLevel.admin])
  @Query(returns => Document, { nullable: true })
  async document(@Arg('id', () => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const checkPermissions = ctx.isAdmin ? undefined : { userId: ctx.user!._id };
    const document = await ControllerFactory.get('documents').get({
      docId: id,
      checkPermissions: checkPermissions
    });

    if (!document) return null;
    return Document.fromEntity(document);
  }

  @FieldResolver(type => User, { nullable: true })
  async author(@Root() root: Document) {
    const document = await ControllerFactory.get('documents').get({ docId: root._id });
    const author = await ControllerFactory.get('users').getUser({ id: document!.author! });

    if (!author) return null;
    return User.fromEntity(author!);
  }

  @FieldResolver(type => Template)
  async template(@Root() root: Document) {
    const document = await ControllerFactory.get('documents').get({ docId: root._id });
    const template = await ControllerFactory.get('templates').get(document!.template);
    return Template.fromEntity(template!);
  }

  @FieldResolver(type => [Element])
  async elements(@Root() root: Document) {
    const elements = await ControllerFactory.get('documents').getElements(root._id);
    return elements.map(e => Element.fromEntity(e));
  }

  @FieldResolver(type => JsonType)
  async html(@Root() root: Document) {
    return await ControllerFactory.get('documents').getDocHtml(root._id);
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Boolean)
  async changeDocTemplate(
    @Arg('id', type => GraphQLObjectId) id: ObjectID,
    @Arg('template', type => GraphQLObjectId) template: ObjectID,
    @Ctx() ctx: IGQLContext
  ) {
    addElmQueue;
    removeElmQueue;
    return await ControllerFactory.get('documents').changeTemplate(
      {
        docId: id,
        checkPermissions: ctx.isAdmin ? undefined : { userId: ctx.user!._id }
      },
      template
    );
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Element)
  async addDocElement(
    @Arg('docId', type => GraphQLObjectId) docId: ObjectID,
    @Arg('token', type => AddElementInput) token: Element,
    @Arg('index', type => Int, { nullable: true }) index: number | undefined,
    @Ctx() ctx: IGQLContext
  ) {
    const ticket = addElmQueue.register();
    await addElmQueue.waitForTurn(ticket);

    try {
      const elm = await ControllerFactory.get('documents').addElement(
        {
          docId: docId,
          checkPermissions: ctx.isAdmin ? undefined : { userId: ctx.user!._id }
        },
        token as IDraftElement<'server'>,
        index
      );

      addElmQueue.processNext();
      return Element.fromEntity(elm);
    } catch (err) {
      addElmQueue.processNext();
      throw err;
    }
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Element)
  async updateDocElement(
    @Arg('docId', type => GraphQLObjectId) docId: ObjectID,
    @Arg('token', type => UpdateElementInput) token: Element,
    @Arg('index', type => Int, { nullable: true }) index: number,
    @Ctx() ctx: IGQLContext
  ) {
    const element = await ControllerFactory.get('documents').updateElement(
      {
        docId: docId,
        checkPermissions: ctx.isAdmin ? undefined : { userId: ctx.user!._id }
      },
      token as IDraftElement<'server'>
    );

    return Element.fromEntity(element);
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Boolean)
  async removeDocElement(
    @Arg('docId', type => GraphQLObjectId) docId: ObjectID,
    @Arg('elementId', type => GraphQLObjectId) elementId: ObjectID,
    @Ctx() ctx: IGQLContext
  ) {
    const ticket = removeElmQueue.register();
    await removeElmQueue.waitForTurn(ticket);

    try {
      await ControllerFactory.get('documents').removeElement(
        {
          docId,
          checkPermissions: ctx.isAdmin ? undefined : { userId: ctx.user!._id }
        },
        elementId
      );

      removeElmQueue.processNext();
      return true;
    } catch (err) {
      removeElmQueue.processNext();
      throw err;
    }
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
