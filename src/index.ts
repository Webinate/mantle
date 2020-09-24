export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Mongo object id scalar type */
  ObjectId: any;
  /** 64-bit integral numbers */
  Long: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
};

export type AddCategoryInput = {
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  parent?: Maybe<Scalars['ObjectId']>;
};

export type AddCommentInput = {
  user?: Maybe<Scalars['ObjectId']>;
  post: Scalars['ObjectId'];
  parent?: Maybe<Scalars['ObjectId']>;
  public?: Maybe<Scalars['Boolean']>;
  content: Scalars['String'];
  children?: Maybe<Array<Scalars['ObjectId']>>;
};

export type AddElementInput = {
  parent?: Maybe<Scalars['ObjectId']>;
  type: ElementType;
  html?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['ObjectId']>;
  style?: Maybe<Scalars['JSON']>;
};

export type AddPostInput = {
  author?: Maybe<Scalars['ObjectId']>;
  title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  brief?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Scalars['ObjectId']>>;
  tags?: Maybe<Array<Scalars['String']>>;
  featuredImage?: Maybe<Scalars['ObjectId']>;
};

export type AddUserInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  avatarFile?: Maybe<Scalars['ObjectId']>;
  privileges?: Maybe<UserPrivilege>;
  meta?: Maybe<Scalars['JSON']>;
};

export type AddVolumeInput = {
  name: Scalars['String'];
  user?: Maybe<Scalars['ObjectId']>;
  type?: Maybe<VolumeType>;
  memoryAllocated?: Maybe<Scalars['Long']>;
  meta?: Maybe<Scalars['JSON']>;
};

/** Object representing a Authentication response */
export type AuthResponse = {
  __typename?: 'AuthResponse';
  message: Scalars['String'];
  authenticated: Scalars['Boolean'];
  user?: Maybe<User>;
};

/** Object representing a Category */
export type Category = {
  __typename?: 'Category';
  _id: Scalars['ObjectId'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  parent?: Maybe<Category>;
  children?: Maybe<Array<Category>>;
};

/** Object representing a Comment */
export type Comment = {
  __typename?: 'Comment';
  _id: Scalars['ObjectId'];
  author: Scalars['String'];
  user?: Maybe<User>;
  post: Post;
  parent?: Maybe<Comment>;
  public: Scalars['Boolean'];
  content: Scalars['String'];
  children: Array<Comment>;
  createdOn: Scalars['Long'];
  lastUpdated: Scalars['Long'];
};

export type CommentSortType = 
  | 'updated'
  | 'created';

export type CommentVisibility = 
  | 'all'
  | 'public'
  | 'private';

/** Object representing a Document */
export type Document = {
  __typename?: 'Document';
  _id: Scalars['ObjectId'];
  author?: Maybe<User>;
  template: Template;
  createdOn: Scalars['Long'];
  lastUpdated: Scalars['Long'];
  elementsOrder?: Maybe<Array<Scalars['String']>>;
  elements?: Maybe<Array<Element>>;
  html?: Maybe<Scalars['JSON']>;
};

/** Object representing a Draft */
export type Draft = {
  __typename?: 'Draft';
  _id: Scalars['ObjectId'];
  html: Scalars['JSON'];
  createdOn: Scalars['Long'];
  parent: Document;
};

/** Object representing a Element */
export type Element = {
  __typename?: 'Element';
  _id: Scalars['ObjectId'];
  parent: Scalars['ObjectId'];
  type: ElementType;
  html: Scalars['String'];
  zone: Scalars['String'];
  image?: Maybe<File>;
  style?: Maybe<Scalars['JSON']>;
};

/** Describes the different types of allowed elements */
export type ElementType = 
  | 'paragraph'
  | 'list'
  | 'image'
  | 'code'
  | 'header1'
  | 'header2'
  | 'header3'
  | 'header4'
  | 'header5'
  | 'header6'
  | 'html';

/** Object representing a File */
export type File = {
  __typename?: 'File';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  identifier: Scalars['String'];
  publicURL: Scalars['String'];
  mimeType: Scalars['String'];
  created: Scalars['Long'];
  size: Scalars['Long'];
  numDownloads: Scalars['Int'];
  isPublic: Scalars['Boolean'];
  user: User;
  volume: Volume;
  parentFile?: Maybe<File>;
  meta?: Maybe<Scalars['JSON']>;
};

/** The type of sorting performed when fetching files */
export type FileSortType = 
  | 'created'
  | 'memory'
  | 'name';


export type LoginInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  remember?: Maybe<Scalars['Boolean']>;
};


export type Mutation = {
  __typename?: 'Mutation';
  createCategory: Category;
  updateCategory: Category;
  removeCategory: Scalars['Boolean'];
  addUser: User;
  removeUser: Scalars['Boolean'];
  updateUser: User;
  removeComment: Scalars['Boolean'];
  addComment: Comment;
  patchComment: Comment;
  login: AuthResponse;
  register: AuthResponse;
  approveActivation: Scalars['Boolean'];
  resendActivation: Scalars['Boolean'];
  requestPasswordReset: Scalars['Boolean'];
  passwordReset: Scalars['Boolean'];
  logout: Scalars['Boolean'];
  addVolume: Volume;
  updateVolume: Volume;
  removeVolume: Scalars['Boolean'];
  removeFile: Scalars['Boolean'];
  patchFile: File;
  changeDocTemplate: Scalars['Boolean'];
  addDocElement: Element;
  updateDocElement: Element;
  removeDocElement: Scalars['Boolean'];
  removePostDraft: Scalars['Boolean'];
  createPost: Post;
  patchPost: Post;
  removePost: Scalars['Boolean'];
};


export type MutationCreateCategoryArgs = {
  token: AddCategoryInput;
};


export type MutationUpdateCategoryArgs = {
  token: UpdateCategoryInput;
};


export type MutationRemoveCategoryArgs = {
  id: Scalars['String'];
};


export type MutationAddUserArgs = {
  token: AddUserInput;
};


export type MutationRemoveUserArgs = {
  username: Scalars['String'];
};


export type MutationUpdateUserArgs = {
  token: UpdateUserInput;
};


export type MutationRemoveCommentArgs = {
  id: Scalars['ObjectId'];
};


export type MutationAddCommentArgs = {
  token: AddCommentInput;
};


export type MutationPatchCommentArgs = {
  token: UpdateCommentInput;
};


export type MutationLoginArgs = {
  token: LoginInput;
};


export type MutationRegisterArgs = {
  token: RegisterInput;
};


export type MutationApproveActivationArgs = {
  username: Scalars['String'];
};


export type MutationResendActivationArgs = {
  activationPath?: Maybe<Scalars['String']>;
  username: Scalars['String'];
};


export type MutationRequestPasswordResetArgs = {
  accountRedirectURL?: Maybe<Scalars['String']>;
  username: Scalars['String'];
};


export type MutationPasswordResetArgs = {
  password: Scalars['String'];
  key: Scalars['String'];
  username: Scalars['String'];
};


export type MutationAddVolumeArgs = {
  token: AddVolumeInput;
};


export type MutationUpdateVolumeArgs = {
  token: UpdateVolumeInput;
};


export type MutationRemoveVolumeArgs = {
  id: Scalars['ObjectId'];
};


export type MutationRemoveFileArgs = {
  volumeId?: Maybe<Scalars['ObjectId']>;
  id: Scalars['ObjectId'];
};


export type MutationPatchFileArgs = {
  token: UpdateFileInput;
};


export type MutationChangeDocTemplateArgs = {
  template: Scalars['ObjectId'];
  id: Scalars['ObjectId'];
};


export type MutationAddDocElementArgs = {
  index?: Maybe<Scalars['Int']>;
  token: AddElementInput;
  docId: Scalars['ObjectId'];
};


export type MutationUpdateDocElementArgs = {
  index?: Maybe<Scalars['Int']>;
  token: UpdateElementInput;
  docId: Scalars['ObjectId'];
};


export type MutationRemoveDocElementArgs = {
  elementId: Scalars['ObjectId'];
  docId: Scalars['ObjectId'];
};


export type MutationRemovePostDraftArgs = {
  draftId: Scalars['ObjectId'];
  postId: Scalars['ObjectId'];
};


export type MutationCreatePostArgs = {
  token: AddPostInput;
};


export type MutationPatchPostArgs = {
  token: UpdatePostInput;
};


export type MutationRemovePostArgs = {
  id: Scalars['ObjectId'];
};


/** A page of wrapper of categories */
export type PaginatedCategoryResponse = {
  __typename?: 'PaginatedCategoryResponse';
  data: Array<Category>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of comments */
export type PaginatedCommentsResponse = {
  __typename?: 'PaginatedCommentsResponse';
  data: Array<Comment>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of files */
export type PaginatedFilesResponse = {
  __typename?: 'PaginatedFilesResponse';
  data: Array<File>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of posts */
export type PaginatedPostsResponse = {
  __typename?: 'PaginatedPostsResponse';
  data: Array<Post>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of templates */
export type PaginatedTemplateResponse = {
  __typename?: 'PaginatedTemplateResponse';
  data: Array<Template>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of users */
export type PaginatedUserResponse = {
  __typename?: 'PaginatedUserResponse';
  data: Array<User>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** A page of wrapper of volumes */
export type PaginatedVolumeResponse = {
  __typename?: 'PaginatedVolumeResponse';
  data: Array<Volume>;
  count: Scalars['Int'];
  limit: Scalars['Int'];
  index: Scalars['Int'];
};

/** Object representing a Post */
export type Post = {
  __typename?: 'Post';
  _id: Scalars['ObjectId'];
  author?: Maybe<User>;
  title: Scalars['String'];
  slug: Scalars['String'];
  brief: Scalars['String'];
  public: Scalars['Boolean'];
  categories: Array<Category>;
  tags: Array<Scalars['String']>;
  createdOn: Scalars['Long'];
  lastUpdated: Scalars['Long'];
  featuredImage?: Maybe<File>;
  document: Document;
  latestDraft?: Maybe<Draft>;
};

export type PostSortType = 
  | 'title'
  | 'created'
  | 'modified';

export type PostVisibility = 
  | 'all'
  | 'public'
  | 'private';

export type Query = {
  __typename?: 'Query';
  category?: Maybe<Category>;
  /** Gets an array of all categories */
  categories: PaginatedCategoryResponse;
  user?: Maybe<User>;
  users: PaginatedUserResponse;
  comment?: Maybe<Comment>;
  /** Gets a paginated list of comments */
  comments: PaginatedCommentsResponse;
  authenticated: AuthResponse;
  volume?: Maybe<Volume>;
  volumes: PaginatedVolumeResponse;
  file?: Maybe<File>;
  /** Gets a paginated list of files */
  files: PaginatedFilesResponse;
  document?: Maybe<Document>;
  template?: Maybe<Template>;
  /** Gets an array of all templates */
  templates: PaginatedTemplateResponse;
  post?: Maybe<Post>;
  /** Gets a paginated list of posts */
  posts: PaginatedPostsResponse;
  getPostDrafts: Array<Draft>;
};


export type QueryCategoryArgs = {
  slug?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
};


export type QueryCategoriesArgs = {
  root?: Maybe<Scalars['Boolean']>;
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  user: Scalars['String'];
};


export type QueryUsersArgs = {
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
};


export type QueryCommentArgs = {
  id: Scalars['ObjectId'];
};


export type QueryCommentsArgs = {
  root?: Maybe<Scalars['Boolean']>;
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  keyword?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  visibility?: Maybe<CommentVisibility>;
  sortOrder?: Maybe<SortOrder>;
  sortType?: Maybe<CommentSortType>;
  parentId?: Maybe<Scalars['ObjectId']>;
  postId?: Maybe<Scalars['ObjectId']>;
};


export type QueryVolumeArgs = {
  id: Scalars['ObjectId'];
};


export type QueryVolumesArgs = {
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  sortOrder?: Maybe<SortOrder>;
  sortType?: Maybe<VolumeSortType>;
};


export type QueryFileArgs = {
  id: Scalars['ObjectId'];
};


export type QueryFilesArgs = {
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  search?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  volumeId?: Maybe<Scalars['ObjectId']>;
  sortOrder?: Maybe<SortOrder>;
  sortType?: Maybe<FileSortType>;
};


export type QueryDocumentArgs = {
  id: Scalars['ObjectId'];
};


export type QueryTemplateArgs = {
  id?: Maybe<Scalars['ObjectId']>;
};


export type QueryPostArgs = {
  slug?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ObjectId']>;
};


export type QueryPostsArgs = {
  index?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  author?: Maybe<Scalars['String']>;
  keyword?: Maybe<Scalars['String']>;
  visibility?: Maybe<PostVisibility>;
  sortOrder?: Maybe<SortOrder>;
  sortType?: Maybe<PostSortType>;
  categories?: Maybe<Array<Scalars['ObjectId']>>;
  tags?: Maybe<Array<Scalars['String']>>;
  requiredTags?: Maybe<Array<Scalars['String']>>;
};


export type QueryGetPostDraftsArgs = {
  id: Scalars['ObjectId'];
};

export type RegisterInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
  activationUrl?: Maybe<Scalars['String']>;
};

export type SortOrder = 
  | 'asc'
  | 'desc';

/** Object representing a Template */
export type Template = {
  __typename?: 'Template';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  description: Scalars['String'];
  defaultZone: Scalars['String'];
  zones: Array<Scalars['String']>;
};

export type UpdateCategoryInput = {
  _id: Scalars['ObjectId'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  parent?: Maybe<Scalars['ObjectId']>;
};

export type UpdateCommentInput = {
  _id: Scalars['ObjectId'];
  public?: Maybe<Scalars['Boolean']>;
  content: Scalars['String'];
};

export type UpdateElementInput = {
  _id: Scalars['ObjectId'];
  parent?: Maybe<Scalars['ObjectId']>;
  html?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['ObjectId']>;
  style?: Maybe<Scalars['JSON']>;
};

export type UpdateFileInput = {
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  isPublic?: Maybe<Scalars['Boolean']>;
};

export type UpdatePostInput = {
  _id: Scalars['ObjectId'];
  author?: Maybe<Scalars['ObjectId']>;
  title?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  brief?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Scalars['ObjectId']>>;
  tags?: Maybe<Array<Scalars['String']>>;
  featuredImage?: Maybe<Scalars['ObjectId']>;
  createdOn?: Maybe<Scalars['Long']>;
};

export type UpdateUserInput = {
  _id: Scalars['ObjectId'];
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  privileges?: Maybe<UserPrivilege>;
  meta?: Maybe<Scalars['JSON']>;
  avatar?: Maybe<Scalars['String']>;
  avatarFile?: Maybe<Scalars['ObjectId']>;
};

export type UpdateVolumeInput = {
  _id: Scalars['ObjectId'];
  memoryUsed?: Maybe<Scalars['Long']>;
  name?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['ObjectId']>;
  memoryAllocated?: Maybe<Scalars['Long']>;
  meta?: Maybe<Scalars['JSON']>;
};

/** Object representing a User */
export type User = {
  __typename?: 'User';
  _id: Scalars['ObjectId'];
  username: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  registerKey: Scalars['String'];
  avatar: Scalars['String'];
  avatarFile?: Maybe<File>;
  createdOn: Scalars['Long'];
  lastLoggedIn: Scalars['Long'];
  isActivated: Scalars['Boolean'];
  privileges: UserPrivilege;
  meta: Scalars['JSON'];
};

/** The core type of user privilege */
export type UserPrivilege = 
  | 'super'
  | 'admin'
  | 'regular';

/** Object representing a Volume */
export type Volume = {
  __typename?: 'Volume';
  _id: Scalars['ObjectId'];
  name: Scalars['String'];
  identifier: Scalars['String'];
  type: VolumeType;
  created: Scalars['Long'];
  memoryUsed: Scalars['Long'];
  memoryAllocated: Scalars['Long'];
  user: User;
  meta?: Maybe<Scalars['JSON']>;
};

/** The type of sorting performed when fetching volumes */
export type VolumeSortType = 
  | 'created'
  | 'memory'
  | 'name';

/** The core type of volume type */
export type VolumeType = 
  | 'google'
  | 'local';
