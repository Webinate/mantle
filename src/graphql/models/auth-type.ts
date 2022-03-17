import { ObjectType, Field, InputType } from 'type-graphql';
import { User } from './user-type';
import { IsEmail, MinLength } from 'class-validator';
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
  @MinLength(5, { message: 'You must have at least 5 characters' })
  email: string;

  @Field({ nullable: true })
  activationUrl: string;

  constructor(data?: Partial<RegisterInput>) {
    if (data) Object.assign(this, data);
  }
}