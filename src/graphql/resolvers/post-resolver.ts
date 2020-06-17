import {
  Resolver,
  Authorized,
  Mutation,
  Arg,
  Ctx,
  ResolverInterface,
  FieldResolver,
  Root,
  Query,
  Args
} from 'type-graphql';
import { Post, AddPostInput, UpdatePostInput, GetPostsArgs, PaginatedPostsResponse } from '../models/post-type';
import { Document } from '../models/document-type';
import { UserPrivilege, PostVisibility, AuthLevel } from '../../core/enums';
import ControllerFactory from '../../core/controller-factory';
import { GraphQLObjectId } from '../scalars/object-id';
import { ObjectID } from 'mongodb';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { IPost } from '../../types/models/i-post';
import { User } from '../models/user-type';
import { File } from '../models/file-type';
import { Draft } from '../models/draft-type';

@Resolver(of => Post)
export class PostResolver implements ResolverInterface<Post> {
  @Authorized<AuthLevel>([AuthLevel.none])
  @Query(returns => Post, { nullable: true })
  async post(
    @Arg('id', type => GraphQLObjectId, { nullable: true }) id: ObjectID,
    @Arg('slug', type => String, { nullable: true }) slug: string,
    @Ctx() ctx: IGQLContext
  ) {
    const post = await ControllerFactory.get('posts').getPost({
      id: id,
      slug: slug
    })!;

    // Only admins are allowed to see private posts
    if (!post.public && (!ctx.user || (ctx.user && ctx.user.privileges === 'regular')))
      throw new Error('That post is marked private');

    return Post.fromEntity(post);
  }

  @Authorized<AuthLevel>([AuthLevel.none])
  @Query(returns => PaginatedPostsResponse, { description: 'Gets a paginated list of posts' })
  async posts(
    @Args(type => GetPostsArgs)
    {
      index,
      limit,
      keyword,
      author,
      categories,
      requiredTags,
      tags,
      sortOrder,
      sortType,
      visibility
    }: Partial<GetPostsArgs>,
    @Ctx() ctx: IGQLContext
  ) {
    const { user: auth } = ctx;

    // If no user we only allow public
    if (!auth) visibility = PostVisibility.public;
    // If an admin - we do not need visibility
    else if (auth.privileges === UserPrivilege.regular) visibility = PostVisibility.public;
    // Regular users only see public
    else {
      if (visibility === 'public') visibility = PostVisibility.public;
      else if (visibility === 'private') visibility = PostVisibility.private;
      else visibility = PostVisibility.all;
    }

    const response = await ControllerFactory.get('posts').getPosts({
      index: index,
      limit: limit,
      sortOrder: sortOrder,
      author,
      visibility: visibility,
      sort: sortType,
      categories,
      keyword: keyword,
      tags,
      requiredTags
    });

    return PaginatedPostsResponse.fromEntity(response);
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Post)
  async createPost(@Arg('token') token: AddPostInput, @Ctx() ctx: IGQLContext) {
    // User is passed from the authentication function
    if (!token.author) token.author = ctx.user!._id;

    const post = await ControllerFactory.get('posts').create(token as Partial<IPost<'server'>>);
    return Post.fromEntity(post!);
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Post)
  async patchPost(@Arg('token') token: UpdatePostInput, @Ctx() ctx: IGQLContext) {
    const post = await ControllerFactory.get('posts').update(token._id, token as Partial<IPost<'server'>>);
    if (!post) return null;

    return Post.fromEntity(post);
  }

  @Authorized<AuthLevel>([AuthLevel.admin])
  @Mutation(returns => Boolean)
  async removePost(@Arg('id', type => GraphQLObjectId) id: ObjectID) {
    await ControllerFactory.get('posts').removePost(id);
    return true;
  }

  @FieldResolver(type => User, { nullable: true })
  async author(@Root() root: Post) {
    const post = await ControllerFactory.get('posts').getPost({ id: root._id });
    if (!post.author) return null;

    const author = await ControllerFactory.get('users').getUser({ id: post.author });
    return User.fromEntity(author!);
  }

  @FieldResolver(type => User, { nullable: true })
  async featuredImage(@Root() root: Post) {
    const post = await ControllerFactory.get('posts').getPost({ id: root._id });
    if (!post.featuredImage) return null;

    const file = await ControllerFactory.get('files').getFile(post.featuredImage);
    if (!file) return null;
    return File.fromEntity(file);
  }

  @FieldResolver(type => User, { nullable: true })
  async document(@Root() root: Post) {
    const post = await ControllerFactory.get('posts').getPost({ id: root._id });
    const document = await ControllerFactory.get('documents').get({ docId: post.document });
    return Document.fromEntity(document!);
  }

  @FieldResolver(type => User, { nullable: true })
  async latestDraft(@Root() root: Post) {
    const post = await ControllerFactory.get('posts').getPost({ id: root._id });
    if (!post.latestDraft) return null;

    const draft = await ControllerFactory.get('documents').getDraft(post.latestDraft);
    return Draft.fromEntity(draft!);
  }
}
