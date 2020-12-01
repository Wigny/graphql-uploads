import { ApolloServer } from "apollo-server";
import gql from "graphql-tag";

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Mutation: {
    singleUpload: (parent: any, args: { file: Promise<File>; }) => {
      return args.file.then((file: File) => {
        // Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
        // file.createReadStream() is a readable node stream that contains the contents of the uploaded file
        // node stream api: https://nodejs.org/api/stream.html
        return file;
      });
    },
  },
  Query: {
    // tslint:disable-next-line:no-empty
    uploads: (parent: any, args: any) => { },
  },
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

server.listen({ port: process.env.PORT || 8000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
