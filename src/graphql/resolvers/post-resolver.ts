import { Resolver, Authorized, Mutation, Arg, Ctx } from 'type-graphql';
import { Post, AddPostInput, UpdatePostInput } from '../models/post-type';
import { UserPrivilege } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { GraphQLObjectId } from '../scalars/object-id';
import { ObjectID } from 'mongodb';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { IPost } from '../../types/models/i-post';

@Resolver(of => Post)
export class PostResolver {
  @Authorized<UserPrivilege>([UserPrivilege.admin])
  @Mutation(returns => Post)
  async createPost(@Arg('token') token: AddPostInput, @Ctx() ctx: IGQLContext) {
    // User is passed from the authentication function
    if (!token.author) token.author = ctx.user!._id;

    const post = await ControllerFactory.get('posts').create(token as Partial<IPost<'server'>>);
    return Post.fromEntity(post!);
  }

  @Authorized<UserPrivilege>([UserPrivilege.admin])
  @Mutation(returns => Post)
  async patchPost(@Arg('token') token: UpdatePostInput, @Ctx() ctx: IGQLContext) {
    const post = await ControllerFactory.get('posts').update(token._id, token as Partial<IPost<'server'>>);
    return post;
  }

  @Authorized<UserPrivilege>([UserPrivilege.admin])
  @Mutation(returns => Boolean)
  async removePost(@Arg('id', type => GraphQLObjectId) id: ObjectID) {
    await ControllerFactory.get('posts').removePost(id);
    return true;
  }
}
