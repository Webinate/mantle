import gql from '../../../utils/gql';

export const VOLUME_FIELDS = gql`
  fragment VolumeFields on Volume {
    _id
    created
    identifier
    memoryAllocated
    memoryUsed
    meta
    name
    type
  }
`;
