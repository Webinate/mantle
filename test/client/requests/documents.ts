import gql from '../gql';
import { DOCUMENT_FIELDS } from '../fragments/document';

export const GET_DOCUMENT = gql`
  query GET_DOCUMENT($id: ObjectId!) {
    document(id: $id) {
      ...DocumentFields
    }
  }

  ${DOCUMENT_FIELDS}
`;

export const CHANGE_DOC_TEMPLATE = gql`
  mutation CHANGE_DOC_TEMPLATE($template: ObjectId!, $id: ObjectId!) {
    changeDocTemplate(template: $template, id: $id)
  }
`;

export const ADD_DOC_ELEMENT = gql`
  mutation ADD_DOC_ELEMENT($docId: ObjectId!, $token: AddElementInput!, $index: Int) {
    addDocElement(token: $token, docId: $docId, index: $index) {
      _id
      html
      style
      type
      zone
      parent
      image {
        _id
        publicURL
      }
    }
  }
`;

export const UPDATE_DOC_ELEMENT = gql`
  mutation UPDATE_DOC_ELEMENT($docId: ObjectId!, $token: UpdateElementInput!, $index: Int) {
    updateDocElement(token: $token, docId: $docId, index: $index) {
      _id
      html
      style
      type
      zone
      parent
      image {
        _id
        publicURL
      }
    }
  }
`;

export const REMOVE_DOC_ELEMENT = gql`
  mutation REMOVE_DOC_ELEMENT($docId: ObjectId!, $elementId: ObjectId!) {
    removeDocElement(elementId: $elementId, docId: $docId)
  }
`;
