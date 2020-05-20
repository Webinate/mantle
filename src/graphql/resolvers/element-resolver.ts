import { Resolver, ResolverInterface, FieldResolver, Root } from 'type-graphql';
import { Element } from '../models/element-type';
import { File } from '../models/file-type';
import ControllerFactory from '../../core/controller-factory';
import { IImageElement } from '../../types/models/i-draft-elements';
import { buildHtml } from '../../controllers/build-html';

@Resolver(of => Element)
export class ElementResolver implements ResolverInterface<Element> {
  @FieldResolver(type => String)
  async html(@Root() root: Element) {
    const element = (await ControllerFactory.get('documents').getElement(root._id)) as IImageElement<'server'>;
    const html = await buildHtml(element);
    return html;
  }

  @FieldResolver(type => Element, { nullable: true })
  async image(@Root() root: Element) {
    const element = (await ControllerFactory.get('documents').getElement(root._id)) as IImageElement<'server'>;
    if (!element.image) return null;

    const file = await ControllerFactory.get('files').getFile(element.image);
    if (!file) return null;
    return File.fromEntity(file!);
  }
}
