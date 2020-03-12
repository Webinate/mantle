import { ObjectType, Field, InputType } from 'type-graphql';
import { User } from './user-type';
import { IsEmail } from 'class-validator';
import { IsSafeText } from '../../decorators/isSafeText';

@ObjectType({ description: 'Object representing a Authentication response' })
export class AuthResponse {
  @Field()
  message: string;

  @Field()
  authenticated: boolean;

  @Field(type => User, { nullable: true })
  user: User | null;

  constructor(data?: Partial<AuthResponse>) {
    if (data) Object.assign(this, data);
  }
}

@InputType()
export class LoginInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ defaultValue: true, nullable: true })
  remember: boolean;

  constructor(data?: Partial<LoginInput>) {
    if (data) Object.assign(this, data);
  }
}

@InputType()
export class RegisterInput {
  @Field()
  @IsSafeText()
  username: string;

  @Field()
  password: string;

  @Field()
  @IsEmail(undefined, { message: 'Invalid email format' })
  email: string;

  @Field({ nullable: true })
  activationUrl: string;

  constructor(data?: Partial<RegisterInput>) {
    if (data) Object.assign(this, data);
  }
}

// import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
// import { UserType } from './user-type';

// export const AuthType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Auth',
//   fields: () => ({
//     message: { type: GraphQLString },
//     authenticated: { type: GraphQLBoolean },
//     user: { type: UserType }
//   })
// });
