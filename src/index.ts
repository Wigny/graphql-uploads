import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    running: Boolean
  }

  type Mutation {
    upload(files: [Upload!]!): [File!]!
  }
`;

const resolvers = {
  Query: {
    running: () => true,
  },
  Mutation: {
    upload: async (parent: any, args: any) => {
      const files = await args.files;

      return files;
    },
  },
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
