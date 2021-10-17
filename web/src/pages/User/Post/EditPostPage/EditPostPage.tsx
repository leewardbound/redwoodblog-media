import EditPostCell from 'src/components/User/Post/EditPostCell'

type PostPageProps = {
  id: number
}

const EditPostPage = ({ id }: PostPageProps) => {
  return <EditPostCell id={id} />
}

export default EditPostPage
