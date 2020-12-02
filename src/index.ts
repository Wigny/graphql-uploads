import { BlobServiceClient } from '@azure/storage-blob';
import { ApolloServer, gql } from 'apollo-server';
import { v4 as uuid } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';
import { FileUpload } from 'graphql-upload';

dotenv.config();

const { PORT, CONNECT_STR, CONTAINER_NAME, ACCOUNT_NAME } = process.env;

const container = BlobServiceClient
  .fromConnectionString(CONNECT_STR as string)
  .getContainerClient(CONTAINER_NAME as string);

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    url: String!
  }

  type Query {
    hello:  String
  }

  type Mutation {
    upload(files: [Upload!]!): [File!]!
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
  Mutation: {
    upload: async (_parent: any, args: { files: FileUpload[] }) => {
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

const upload = async ({ filename, mimetype, createReadStream }: FileUpload) => {
  const stream = createReadStream();
  const file = uuid() + path.extname(filename);

  await container
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
  introspection: true
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
