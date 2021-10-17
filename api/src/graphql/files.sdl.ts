export const schema = gql`
  type File {
    id: String!
    createdAt: DateTime!
    storage: String!
    path: String!
    title: String
    b64_data: String
    extension: String
    owner: Author!
    owner_id: String!
  }

  type Query {
    files: [File!]! @requireAuth
    file(id: String!): File @requireAuth
  }

  input CreateFileInput {
    storage: String!
    path: String!
    title: String
    b64_data: String
    extension: String
  }

  input UpdateFileInput {
    storage: String
    path: String
    title: String
    b64_data: String
    extension: String
  }

  type Mutation {
    createFile(input: CreateFileInput!): File! @requireAuth
    updateFile(id: String!, input: UpdateFileInput!): File! @requireAuth
    deleteFile(id: String!): File! @requireAuth
  }
`
