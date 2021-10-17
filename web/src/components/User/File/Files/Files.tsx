import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Link, routes } from '@redwoodjs/router'

import { QUERY } from 'src/components/User/File/FilesCell'

const DELETE_FILE_MUTATION = gql`
  mutation DeleteFileMutation($id: String!) {
    deleteFile(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output
}

const jsonTruncate = (obj) => {
  return truncate(JSON.stringify(obj, null, 2))
}

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}

const FilesList = ({ files }) => {
  const [deleteFile] = useMutation(DELETE_FILE_MUTATION, {
    onCompleted: () => {
      toast.success('File deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete file ' + id + '?')) {
      deleteFile({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Created at</th>
            <th>Storage</th>
            <th>Path</th>
            <th>Title</th>
            <th>Owner id</th>
            <th>Public URL</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{truncate(file.id)}</td>
              <td>{timeTag(file.createdAt)}</td>
              <td>{truncate(file.storage)}</td>
              <td>{truncate(file.path)}</td>
              <td>{truncate(file.title)}</td>
              <td>{truncate(file.owner_id)}</td>
              <td>
                <img src={file.publicURL} />
                <br />
                <a href={file.publicURL}>{truncate(file.publicURL)}</a>
              </td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.userFile({ id: file.id })}
                    title={'Show file ' + file.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.userEditFile({ id: file.id })}
                    title={'Edit file ' + file.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete file ' + file.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(file.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FilesList
