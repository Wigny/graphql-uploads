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

const upload = ({ filename, mimetype, createReadStream }: FileUpload) => {
  const stream = createReadStream();
  const file = uuid() + path.extname(filename);

  return container
    .getBlobClient(file)
    .getBlockBlobClient()
    .uploadStream(stream, 4 * 1024 * 1024, 5, {
      onProgress: ({ loadedBytes }) => console.log({ loadedBytes })
    })
    .then(res => {
      console.log({ res });

      return {
        filename: file,
        mimetype,
        url: `https://${ACCOUNT_NAME}.blob.core.windows.net/files/${file}`,
      }
    })
    .catch(console.error);
}

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
