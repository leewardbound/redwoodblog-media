import type { FindPostById } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Post from 'src/components/User/Post/Post'

export const QUERY = gql`
  query FindPostById($id: Int!) {
    post: post(id: $id) {
      id
      title
      body
      createdAt
      owner_id
      owner {
        email
        posts {
          id
          title
        }
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Post not found</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error.message}</div>
)

export const Success = ({ post }: CellSuccessProps<FindPostById>) => {
  return <Post post={post} />
}
