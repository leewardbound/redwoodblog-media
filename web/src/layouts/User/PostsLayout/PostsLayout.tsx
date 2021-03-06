import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type PostLayoutProps = {
  children: React.ReactNode
}

const PostsLayout = ({ children }: PostLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link
            to={routes.userPosts()}
            className="rw-link"
          >
            Posts
          </Link>
        </h1>
        <Link
          to={routes.userNewPost()}
          className="rw-button rw-button-green"
        >
          <div className="rw-button-icon">+</div> New Post
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default PostsLayout
