import BlogPost from 'src/components/BlogPost/BlogPost'

export const QUERY = gql`
  query BlogPostsQuery {
    posts {
      id
      body
      createdAt
      title
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => <BlogPost key={post.id} post={post} />)
}
