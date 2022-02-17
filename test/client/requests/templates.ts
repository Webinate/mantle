import gql from '../gql';

export const GET_TEMPLATES = gql`
  query getTemplates {
    templates {
      count
      data {
        _id
        defaultZone
        description
        name
        zones
      }
      index
      limit
    }
  }
`;

export const GET_TEMPLATE = gql`
  query getTemplate($id: ObjectId!) {
    template(id: $id) {
      _id
      defaultZone
      description
      name
      zones
    }
  }
`;
