import {
  Resolver,
  Query,
  Args,
  Ctx,
  Authorized,
  Mutation,
  Arg,
  ResolverInterface,
  FieldResolver,
  Root
} from 'type-graphql';
import { Comment, PaginatedCommentsResponse, GetCommentsArgs } from '../models/comment-type';
import ControllerFactory from '../../core/controller-factory';
import { IGQLContext } from '../../types/interfaces/i-gql-context';
import { CommentVisibility, UserPrivilege } from '../../core/enums';
import { GraphQLObjectId } from '../scalars/object-id';
import { ObjectID } from 'mongodb';
import { Error403 } from '../../utils/errors';
import { User } from '../models/user-type';

@Resolver(of => Comment)
export class CommentResolver implements ResolverInterface<Comment> {
  @Authorized<UserPrivilege>([UserPrivilege.regular])
  @Mutation(returns => Boolean)
  async removeComment(@Arg('id', type => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const comment = await ControllerFactory.get('comments').getOne(id);

    // Only admins & owners are allowed
    if (ctx.user!.privileges === 'regular' && ctx.user!.username !== comment.author) throw new Error403();

    await ControllerFactory.get('comments').remove(id);
    return true;
  }

  @Query(returns => Comment, { nullable: true })
  async comment(@Arg('id', type => GraphQLObjectId) id: ObjectID, @Ctx() ctx: IGQLContext) {
    const comment = await ControllerFactory.get('comments').getOne(id);

    // Only admins are allowed to see private comments
    if (!comment.public && (!ctx.user || ctx.user.privileges === 'regular'))
      throw new Error403('That comment is marked private');

    return Comment.fromEntity(comment);
  }

  @FieldResolver(type => User, { nullable: true })
  async user(@Root() root: Comment) {
    const comment = await ControllerFactory.get('comments').getOne(root._id);
    const user = await ControllerFactory.get('users').getUser({ id: comment.user! });
    return User.fromEntity(user!);
  }

  @Query(returns => PaginatedCommentsResponse, { description: 'Gets a paginated list of comments' })
  async comments(
    @Args(type => GetCommentsArgs)
    { index, limit, root, keyword, parentId, postId, sortOrder, user, sortType, visibility }: Partial<GetCommentsArgs>,
    @Ctx() ctx: IGQLContext
  ) {
    const { user: auth } = ctx;

    // Check for visibility
    if (visibility) {
      if (visibility === CommentVisibility.all) visibility = CommentVisibility.all;
      else if (visibility === CommentVisibility.private) visibility = CommentVisibility.private;
      else visibility = CommentVisibility.public;
    }

    // If no user we only allow public
    if (!auth) visibility = CommentVisibility.public;
    // If an admin - we do not need visibility
    else if (auth.privileges === 'admin' || auth.privileges === 'super') visibility = undefined;
    // Regular users only see public
    else visibility = CommentVisibility.public;

    const response = await ControllerFactory.get('comments').getAll({
      index: index,
      limit: limit,
      keyword: keyword,
      root: root,
      parentId: parentId,
      postId: postId,
      visibility: visibility,
      sortOrder: sortOrder,
      sortType: sortType,
      user: user
    });

    return PaginatedCommentsResponse.fromEntity(response);
  }
}
