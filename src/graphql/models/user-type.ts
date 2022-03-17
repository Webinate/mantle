import { ObjectType, Field, InputType, ArgsType, Int, Authorized } from 'type-graphql';
import { PaginatedResponse } from './paginated-response';
import { Page, IUserEntry } from '../../types';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { LongType } from '../scalars/long';
import { JsonType } from '../scalars/json';
import { UserPrivilege, AuthLevel } from '../../core/enums';
import { IsEmail } from 'class-validator';
import { File } from './file-type';

@ObjectType({ description: 'Object representing a User' })
export class User {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field()
  username: string;

  @Field(type => String, { nullable: true })
  @IsEmail()
  email: string | null;

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Field()
  registerKey: string;

  datebaseEmail: string;

  @Field()
  avatar: string;

  @Field(type => File, { nullable: true })
  avatarFile: File | null;

  @Field(type => LongType)
  createdOn: number;

  @Field(type => LongType)
  lastLoggedIn: number;

  @Field(type => Boolean)
  isActivated: boolean;

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Field(type => UserPrivilege)
  privileges: UserPrivilege;

  @Field(type => JsonType)
  meta: any;

  static fromEntity(user: Partial<IUserEntry<'server'>>) {
    const toReturn = new User();
    Object.assign(toReturn, user);
    toReturn.isActivated = !user.registerKey;
    toReturn.datebaseEmail = user.email as string;
    if (user.avatarFile) {
      toReturn.avatarFile = File.fromEntity({ _id: user.avatarFile });
    }

    return toReturn;
  }
}

@InputType()
export class AddUserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  avatar: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  avatarFile: ObjectId | string | null;

  @Field(type => UserPrivilege, { nullable: true, defaultValue: UserPrivilege.regular })
  privileges: UserPrivilege;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  constructor(initialization?: Partial<AddUserInput>) {
    initialization && Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateUserInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field({ nullable: true })
  username: string;

  @IsEmail()
  @Field({ nullable: true })
  email: string;

  @Field(type => UserPrivilege, { nullable: true })
  privileges: UserPrivilege;

  @Field(type => LongType, { nullable: true })
  @Authorized<AuthLevel>([AuthLevel.admin])
  createdOn: number;

  @Field(type => JsonType, { nullable: true })
  meta: any;

  @Field({ nullable: true })
  avatar: string;

  @Field(type => GraphQLObjectId, { nullable: true })
  avatarFile: ObjectId | string | null;

  constructor(initialization?: Partial<UpdateUserInput>) {
    initialization && Object.assign(this, initialization);
  }
}

@ArgsType()
export class GetUsersArgs {
  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit = 10;

  @Field(type => String, { defaultValue: '' })
  search = '';
}

@ObjectType({ description: 'A page of wrapper of users' })
export class PaginatedUserResponse extends PaginatedResponse(User) {
  static fromEntity(page: Page<IUserEntry<'server'>>) {
    const toReturn = new PaginatedUserResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(user => User.fromEntity(user));
    return toReturn;
  }
}
