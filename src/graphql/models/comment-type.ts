import { ObjectType, Field, ArgsType, Int, InputType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { GraphQLObjectId } from '../scalars/object-id';
import { User } from './user-type';
import { LongType } from '../scalars/long';
import { Post } from './post-type';
import { Page, IComment } from '../../types';
import { PaginatedResponse } from './paginated-response';
import { SortOrder, CommentSortType, CommentVisibility } from '../../core/enums';
import { IsValidHtml } from '../../decorators/isValidHtml';

export const allowedCommentTags = [
  'blockquote',
  'p',
  'a',
  'ul',
  'ol',
  'nl',
  'li',
  'b',
  'i',
  'strong',
  'em',
  'strike',
  'code',
  'hr',
  'br',
  'pre'
];
@ObjectType({ description: 'Object representing a Comment' })
export class Comment {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => String)
  author: string;

  @Field(type => User, { nullable: true })
  user: User | null;

  @Field(type => GraphQLObjectId, { nullable: true })
  postId: ObjectId | string;

  @Field(type => GraphQLObjectId, { nullable: true })
  parentId: ObjectId | string;

  @Field(type => Post)
  post: Post;

  @Field(type => Comment, { nullable: true })
  parent: Comment | null;

  @Field(type => Boolean)
  public: boolean;

  @Field()
  content: string;

  @Field(type => [Comment])
  children: Comment[];

  @Field(type => LongType)
  createdOn: number;

  @Field(type => LongType)
  lastUpdated: number;

  static fromEntity(comment: Partial<IComment<'server'>>) {
    const toReturn = new Comment();
    Object.assign(toReturn, comment);

    if (comment.user) toReturn.user = User.fromEntity({ _id: comment.user! });
    if (comment.children) toReturn.children = comment.children.map(child => Comment.fromEntity({ _id: child }));
    if (comment.parent) {
      toReturn.parent = Comment.fromEntity({ _id: comment.parent });
      toReturn.parentId = comment.parent;
    }
    if (comment.post) {
      toReturn.post = Post.fromEntity({ _id: comment.post });
      toReturn.postId = comment.post!;
    }

    return toReturn;
  }
}

@InputType()
export class AddCommentInput {
  @Field(type => GraphQLObjectId, { nullable: true })
  user: ObjectId | string;

  @Field(type => GraphQLObjectId)
  post: ObjectId | string;

  @Field(type => GraphQLObjectId, { nullable: true })
  parent: ObjectId | string;

  @Field(type => Boolean, { defaultValue: true })
  public: boolean;

  @Field()
  @IsValidHtml(true, undefined, allowedCommentTags)
  content: string;

  @Field(type => [GraphQLObjectId], { nullable: true })
  children: (ObjectId | string)[];

  constructor(initialization?: Partial<AddCommentInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@InputType()
export class UpdateCommentInput {
  @Field(type => GraphQLObjectId)
  _id: ObjectId | string;

  @Field(type => Boolean, { defaultValue: true })
  public: boolean;

  @Field()
  @IsValidHtml(true, undefined, allowedCommentTags)
  content: string;

  constructor(initialization?: Partial<UpdateCommentInput>) {
    if (initialization) Object.assign(this, initialization);
  }
}

@ArgsType()
export class GetCommentsArgs {
  @Field(type => Boolean, { nullable: true, defaultValue: false })
  root: boolean;

  @Field(type => Int, { defaultValue: 0 })
  index: number = 0;

  @Field(type => Int, { defaultValue: 10 })
  limit: number;

  @Field(type => String, { nullable: true })
  keyword: string;

  @Field(type => String, { nullable: true })
  user: string;

  @Field(type => CommentVisibility, { defaultValue: CommentVisibility.all })
  visibility: CommentVisibility;

  @Field(type => SortOrder, { defaultValue: SortOrder.desc })
  sortOrder: SortOrder;

  @Field(type => CommentSortType, { defaultValue: CommentSortType.created })
  sortType: CommentSortType;

  @Field(type => GraphQLObjectId, { nullable: true })
  parentId: ObjectId;

  @Field(type => GraphQLObjectId, { nullable: true })
  postId: ObjectId;

  constructor(initialization?: Partial<GetCommentsArgs>) {
    initialization && Object.assign(this, initialization);
  }
}

@ObjectType({ description: 'A page of wrapper of comments' })
export class PaginatedCommentsResponse extends PaginatedResponse(Comment) {
  static fromEntity(page: Page<IComment<'server'>>) {
    const toReturn = new PaginatedCommentsResponse();
    toReturn.count = page.count;
    toReturn.index = page.index;
    toReturn.limit = page.limit;
    toReturn.data = page.data.map(cat => Comment.fromEntity(cat));
    return toReturn;
  }
}
