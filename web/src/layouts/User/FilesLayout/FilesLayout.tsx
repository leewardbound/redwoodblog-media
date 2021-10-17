import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type FileLayoutProps = {
  children: React.ReactNode
}

const FilesLayout = ({ children }: FileLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link
            to={routes.userFiles()}
            className="rw-link"
          >
            Files
          </Link>
        </h1>
        <Link
          to={routes.userNewFile()}
          className="rw-button rw-button-green"
        >
          <div className="rw-button-icon">+</div> New File
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default FilesLayout
