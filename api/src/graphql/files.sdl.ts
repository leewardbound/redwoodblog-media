export const schema = gql`
  type File {
    id: String!
    createdAt: DateTime
    storage: String!
    path: String!
    title: String
    extension: String

    publicAllowed: Boolean
    publicURL: String
    publicURLExpires: DateTime

    owner: Author
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
    from_url: String
    from_b64_data: String
    from_upload: String
    extension: String
  }

  input UpdateFileInput {
    path: String
    title: String
    from_url: String
    from_b64_data: String
    from_upload: String
    extension: String
  }

  type UploadURL {
    url: String!
    name: String!
  }

  type Mutation {
    createFile(input: CreateFileInput!): File! @requireAuth
    updateFile(id: String!, input: UpdateFileInput!): File! @requireAuth
    deleteFile(id: String!): File! @requireAuth
    getFileUploadURL(storage: String!): UploadURL @requireAuth
  }
`
