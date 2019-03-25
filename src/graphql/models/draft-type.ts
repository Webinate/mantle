import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';
import { LongType } from '../scalars/long';
import Controllers from '../../core/controller-factory';
import { IDraft } from '../../types/models/i-draft';
import { DocumentType } from './document-type';

export const DraftType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Draft',
  fields: () => ({
    _id: { type: GraphQLID },
    html: { type: GraphQLString },
    createdOn: { type: LongType },
    parent: {
      type: DocumentType,
      resolve: (parent: IDraft<'client'>) => {
        return Controllers.get('documents').get({ id: parent.parent as string, expandForeignKeys: false });
      }
    }
  })
});
