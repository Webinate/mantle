import {
  UserPrivilege,
  VolumeType,
  VolumeSortType,
  SortOrder,
  ElementType,
  FileSortType,
  CommentSortType,
  CommentVisibility,
  PostVisibility,
  PostSortType
} from '../../core/enums';
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

registerEnumType(FileSortType, {
  name: 'FileSortType',
  description: 'The type of sorting performed when fetching files'
});

registerEnumType(ElementType, {
  name: 'ElementType',
  description: 'Describes the different types of allowed elements'
});

registerEnumType(CommentVisibility, {
  name: 'CommentVisibility'
});

registerEnumType(CommentSortType, {
  name: 'CommentSortType'
});

registerEnumType(PostVisibility, {
  name: 'PostVisibility'
});

registerEnumType(PostSortType, {
  name: 'PostSortType'
});
