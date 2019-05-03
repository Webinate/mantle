import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLEnumType } from 'graphql';
import Controllers from '../../core/controller-factory';
import { DocumentType } from './document-type';
import { IDraftElement, DraftElements } from '../../types/models/i-draft-elements';

const values: { [type: string]: { value: DraftElements } } = {
  ElmParagraph: { value: 'elm-paragraph' },
  ElmList: { value: 'elm-list' },
  ElmImage: { value: 'elm-image' },
  ElmCode: { value: 'elm-code' },
  ElmHeader1: { value: 'elm-header-1' },
  ElmHeader2: { value: 'elm-header-2' },
  ElmHeader3: { value: 'elm-header-3' },
  ElmHeader4: { value: 'elm-header-4' },
  ElmHeader5: { value: 'elm-header-5' },
  ElmHeader6: { value: 'elm-header-6' },
  ElmHtml: { value: 'elm-html' }
};

export const ElementTypeEnum = new GraphQLEnumType({
  name: 'ElementTypeEnum',
  values: values
});

export const ElementType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Element',
  fields: () => ({
    _id: { type: GraphQLID },
    parent: {
      type: DocumentType,
      resolve: (parent: IDraftElement<'client'>) => {
        if (typeof parent.parent === 'string')
          return Controllers.get('documents').get({ id: parent.parent as string, expandForeignKeys: false });
        else return parent.parent;
      }
    },
    type: { type: GraphQLString },
    html: { type: GraphQLString },
    zone: { type: GraphQLString }
  })
});
