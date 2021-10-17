import EditFileCell from 'src/components/User/File/EditFileCell'

type FilePageProps = {
  id: string
}

const EditFilePage = ({ id }: FilePageProps) => {
  return <EditFileCell id={id} />
}

export default EditFilePage
