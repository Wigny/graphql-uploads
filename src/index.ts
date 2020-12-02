import { BlobServiceClient } from '@azure/storage-blob';
import { ApolloServer, gql } from 'apollo-server';
import { v4 as uuid } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { PORT, CONNECT_STR, CONTAINER_NAME, ACCOUNT_NAME } = process.env;

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    url: String!
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
    upload: async (_parent: any, args: any) => {
      console.log({ args });
      console.log({ PORT, CONNECT_STR, CONTAINER_NAME, ACCOUNT_NAME });


      const results: any[] = [];

      // tslint:disable-next-line:prefer-for-of
      for await (const file of args.files) {
        const result = await upload(file);

        results.push(result)
      }

      return results;
    },
  },
};

const upload = async ({ filename, mimetype, createReadStream }: any) => {
  console.log({ filename, mimetype, createReadStream });

  const stream = createReadStream();
  const file = uuid() + path.extname(filename);

  await BlobServiceClient
    .fromConnectionString(CONNECT_STR as string)
    .getContainerClient(CONTAINER_NAME as string)
    .getBlobClient(file)
    .getBlockBlobClient()
    .uploadStream(stream);

  return {
    filename: file,
    mimetype,
    url: `https://${ACCOUNT_NAME}.blob.core.windows.net/files/${file}`,
  }
}

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
