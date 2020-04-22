import gql from '../../../utils/gql';
import { DOCUMENT_FIELDS } from '../fragments/document';

export const GET_DOCUMENT = gql`
  query GET_DOCUMENT($id: ObjectId!) {
    document(id: $id) {
      ...DocumentFields
    }
  }

  ${DOCUMENT_FIELDS}
`;
