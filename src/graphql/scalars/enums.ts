import { UserPrivilege, VolumeType, VolumeSortType, SortOrder } from '../../core/enums';
import { registerEnumType } from 'type-graphql';

registerEnumType(UserPrivilege, {
  name: 'UserPrivilege',
  description: 'The core type of user privilege'
});

registerEnumType(SortOrder, {
  name: 'SortOrder'
});

registerEnumType(VolumeType, {
  name: 'VolumeType',
  description: 'The core type of volume type'
});

registerEnumType(VolumeSortType, {
  name: 'VolumeSortType',
  description: 'The type of sorting performed when fetching volumes'
});
