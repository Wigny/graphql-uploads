import { ApolloServer } from "apollo-server";
import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    hello:  String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const schema = new ApolloServer({ typeDefs, resolvers });

schema.listen({ port: process.env.PORT || 8000 }).then(({ url }) => {
  console.log(`schema ready at ${url}`);
});
