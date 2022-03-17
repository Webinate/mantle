import { Resolver, ResolverInterface, FieldResolver, Root } from 'type-graphql';
import ControllerFactory from '../../core/controller-factory';
import { Draft } from '../models/draft-type';
import { Document } from '../models/document-type';

@Resolver(of => Draft)
export class DraftResolver implements ResolverInterface<Draft> {
  // @FieldResolver(type => JsonType)
  // async html(@Root() root: Draft) {
  //   const draft = await ControllerFactory.get('documents').getDraft(root._id);
  //   const html = await ControllerFactory.get('documents').getDocHtml(draft.parent);
  //   return html;
  // }

  @FieldResolver(type => Document)
  async parent(@Root() root: Draft) {
    const draft = await ControllerFactory.get('documents').getDraft(root._id);
    const doc = await ControllerFactory.get('documents').get({ docId: draft.parent });
    return Document.fromEntity(doc!);
  }
}
