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
    singleUpload(file: Upload!): File!
  }
`;

const resolvers = {
  Query: {
    running: () => true,
  },
  Mutation: {
    singleUpload: async (parent: any, { file }: any) => {
      const { filename, mimetype, encoding } = await file;

      return { filename, mimetype, encoding, url: '' }
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
