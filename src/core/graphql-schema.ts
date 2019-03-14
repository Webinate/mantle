import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  // GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  // GraphQLNonNull
} from 'graphql';
import { IPost } from '../types/models/i-post';


  registerKey: string;
  sessionId: string;
  avatar: string;
  avatarFile: T extends 'expanded'
  ? IFileEntry<T>
  : T extends 'client'
  ? string | IFileEntry<'client'> | null
  : ObjectID | null;
  createdOn: number;
  lastLoggedIn: number;
  privileges: UserPrivilege;
  passwordTag: string;
  meta: any;


const UserType = new GraphQLObjectType<IPost<'client'>>({
  name: 'Post',
  fields: () => ({
      _id: { type: GraphQLID },
      username: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
      password: { type: GraphQLString },
      password: { type: GraphQLString },
      password: { type: GraphQLString },
      createdOn: { type: GraphQLInt },
      lastLoggedIn: { type: GraphQLInt },
      author: {
          type: UserType,
          resolve(parent, args){
              return Author.findById(parent.authorId);
          }
      }
  })
});

const BookType = new GraphQLObjectType<IPost<'client'>>({
    name: 'Post',
    fields: () => ({
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        slug: { type: GraphQLString },
        public: { type: GraphQLBoolean },
        brief: { type: GraphQLString },
        genre: { type: GraphQLString },
        categories: { type: new GraphQLList(GraphQLString) },
        tags: { type: new GraphQLList(GraphQLString) },
        createdOn: { type: GraphQLInt },
        lastUpdated: { type: GraphQLInt },
        author: {
            type: UserType,
            resolve(parent, args){
                return Author.findById(parent.authorId);
            }
        },
        featuredImage: {
            type: UserType,
            resolve(parent, args){
                return Author.findById(parent.authorId);
            }
        },
        document: {
          type: UserType,
          resolve(parent, args){
              return Author.findById(parent.authorId);
          }
      },
      latestDraft: {
        type: UserType,
        resolve(parent, args){
            return Author.findById(parent.authorId);
        }
    }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return Book.findById(args.id);
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return Author.find({});
            }
        }
    }
});

// const Mutation = new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {
//         addAuthor: {
//             type: AuthorType,
//             args: {
//                 name: { type: GraphQLString },
//                 age: { type: GraphQLInt }
//             },
//             resolve(parent, args){
//                 let author = new Author({
//                     name: args.name,
//                     age: args.age
//                 });
//                 return author.save();
//             }
//         },
//         addBook: {
//             type: BookType,
//             args: {
//                 name: { type: new GraphQLNonNull(GraphQLString) },
//                 genre: { type: new GraphQLNonNull(GraphQLString) },
//                 authorId: { type: new GraphQLNonNull(GraphQLID) }
//             },
//             resolve(parent, args){
//                 let book = new Book({
//                     name: args.name,
//                     genre: args.genre,
//                     authorId: args.authorId
//                 });
//                 return book.save();
//             }
//         }
//     }
// });

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

export default schema;