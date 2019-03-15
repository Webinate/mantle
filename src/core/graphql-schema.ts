import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  // GraphQLInt,
  GraphQLList,
  // GraphQLBoolean,
  GraphQLInt,
  Kind,
  GraphQLScalarType,
  GraphQLEnumType
  // GraphQLNonNull
} from 'graphql';
import ControllerFactory from '../core/controller-factory';

const LongType = new GraphQLScalarType({
  name: 'Long',
  description: '64-bit integral numbers',
  // TODO: Number is only 52-bit
  serialize: Number,
  parseValue: Number,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const num = parseInt(ast.value, 10);
      return num;
    }
    return null;
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    username: {
      type: GraphQLString,

      args: {
        case: {
          type: new GraphQLEnumType({
            name: 'Text_Transform',
            values: {
              UPPERCASE: { value: 'UPPERCASE' },
              LOWERCASE: { value: 'LOWERCASE' }
            }
          })
        }
      },
      resolve(parent, args) {
        return args.case === 'UPPERCASE' ? parent.username.toString().toUpperCase() : parent.username.toString();
      }
    },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    passwordTag: { type: GraphQLString },
    registerKey: { type: GraphQLString },
    avatar: { type: GraphQLString },
    // avatarFile: {
    //     type: UserType,
    //     resolve(parent, args){
    //         return Author.findById(parent.authorId);
    //     }
    // },
    privileges: {
      type: new GraphQLEnumType({
        name: 'User_Priviledges',
        values: {
          super: { value: 'super' },
          admin: { value: 'admin' },
          regular: { value: 'regular' }
        }
      })
    },
    sessionId: { type: GraphQLString },
    createdOn: { type: LongType },
    lastLoggedIn: { type: LongType }
    // author: {
    //     type: UserType,
    //     resolve(parent, args){
    //         return Author.findById(parent.authorId);
    //     }
    // }
  })
});

const UserPageType = new GraphQLObjectType({
  name: 'UserPageType',
  fields: {
    data: { type: new GraphQLList(UserType) },
    limit: { type: GraphQLInt },
    index: { type: GraphQLInt },
    count: { type: GraphQLInt }
  }
});

// // const BookType = new GraphQLObjectType<IPost<'client'>>({
// //     name: 'Post',
// //     fields: () => ({
// //         _id: { type: GraphQLID },
// //         title: { type: GraphQLString },
// //         slug: { type: GraphQLString },
// //         public: { type: GraphQLBoolean },
// //         brief: { type: GraphQLString },
// //         genre: { type: GraphQLString },
// //         categories: { type: new GraphQLList(GraphQLString) },
// //         tags: { type: new GraphQLList(GraphQLString) },
// //         createdOn: { type: GraphQLInt },
// //         lastUpdated: { type: GraphQLInt },
// //         author: {
// //             type: UserType,
// //             resolve(parent, args){
// //                 return Author.findById(parent.authorId);
// //             }
// //         },
// //         featuredImage: {
// //             type: UserType,
// //             resolve(parent, args){
// //                 return Author.findById(parent.authorId);
// //             }
// //         },
// //         document: {
// //           type: UserType,
// //           resolve(parent, args){
// //               return Author.findById(parent.authorId);
// //           }
// //       },
// //       latestDraft: {
// //         type: UserType,
// //         resolve(parent, args){
// //             return Author.findById(parent.authorId);
// //         }
// //     }
// //     })
// // });

// const RootQuery = new GraphQLObjectType({
//   name: "RootQueryType",
//   fields: {
//     book: {
//       type: UserType,
//       args: { id: { type: GraphQLID } },
//       resolve(parent, args) {
//         return ControllerFactory.get("users").getUser({ id: args.id });
//       }
//     },
//     hello: {
//       type: GraphQLString,
//       resolve(parent, args) {
//         return "Hello world";
//       }
//     }
//     // author: {
//     //     type: AuthorType,
//     //     args: { id: { type: GraphQLID } },
//     //     resolve(parent, args){
//     //         return Author.findById(args.id);
//     //     }
//     // },
//     // books: {
//     //     type: new GraphQLList(BookType),
//     //     resolve(parent, args){
//     //         return Book.find({});
//     //     }
//     // },
//     // authors: {
//     //     type: new GraphQLList(AuthorType),
//     //     resolve(parent, args){
//     //         return Author.find({});
//     //     }
//     // }
//   }
// });

// // const Mutation = new GraphQLObjectType({
// //     name: 'Mutation',
// //     fields: {
// //         addAuthor: {
// //             type: AuthorType,
// //             args: {
// //                 name: { type: GraphQLString },
// //                 age: { type: GraphQLInt }
// //             },
// //             resolve(parent, args){
// //                 let author = new Author({
// //                     name: args.name,
// //                     age: args.age
// //                 });
// //                 return author.save();
// //             }
// //         },
// //         addBook: {
// //             type: BookType,
// //             args: {
// //                 name: { type: new GraphQLNonNull(GraphQLString) },
// //                 genre: { type: new GraphQLNonNull(GraphQLString) },
// //                 authorId: { type: new GraphQLNonNull(GraphQLID) }
// //             },
// //             resolve(parent, args){
// //                 let book = new Book({
// //                     name: args.name,
// //                     genre: args.genre,
// //                     authorId: args.authorId
// //                 });
// //                 return book.save();
// //             }
// //         }
// //     }
// // });

// const schema = new GraphQLSchema({
//   query: RootQuery
//   // mutation: Mutation
// });

// export default schema;

// dummy data
var books = [
  { name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorId: '1' },
  { name: 'The Final Empire', genre: 'Fantasy', id: '2', authorId: '2' },
  { name: 'The Hero of Ages', genre: 'Fantasy', id: '4', authorId: '2' },
  { name: 'The Long Earth', genre: 'Sci-Fi', id: '3', authorId: '3' },
  { name: 'The Colour of Magic', genre: 'Fantasy', id: '5', authorId: '3' },
  { name: 'The Light Fantastic', genre: 'Fantasy', id: '6', authorId: '3' }
];

var authors = [
  { name: 'Patrick Rothfuss', age: 44, id: '1' },
  { name: 'Brandon Sanderson', age: 42, id: '2' },
  { name: 'Terry Pratchett', age: 66, id: '3' }
];

const BookType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return authors.find(a => a.id === parent.authorId);
      }
    }
  })
});

const AuthorType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books.filter(b => b.authorId === parent.id);
      }
    }
  })
});

const RootQuery: GraphQLObjectType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { username: { type: GraphQLString } },
      resolve(parent, args) {
        // code to get data from db / other source
        return ControllerFactory.get('users').getUser({
          username: args.username
        });
      }
    },
    users: {
      type: UserPageType,
      args: {
        index: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        search: { type: GraphQLString }
      },
      resolve(parent, args) {
        // code to get data from db / other source
        return ControllerFactory.get('users').getUsers(args.index, args.limit, args.search, true);
      }
    },
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // code to get data from db / other source
        return books.find(b => b.id === args.id);
      }
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return authors.find(a => a.id === args.id);
      }
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books;
      }
    },

    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        return authors;
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQuery
});

export default schema;
