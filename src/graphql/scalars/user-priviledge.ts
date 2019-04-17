import { GraphQLEnumType } from 'graphql';
import { UserPrivilege } from '../../core/enums';

export const UserPriviledgeEnumType = new GraphQLEnumType({
  name: 'UserPriviledgeEnumType',
  values: {
    admin: { value: 'admin' as UserPrivilege },
    regular: { value: 'regular' as UserPrivilege },
    super: { value: 'super' as UserPrivilege }
  }
});
