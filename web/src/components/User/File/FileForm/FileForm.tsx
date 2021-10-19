import {
  FieldError,
  Form,
  FormError,
  Label,
  SelectField,
  Submit,
  TextField,
  useForm,
} from '@redwoodjs/forms'
import { useEffect, useState } from 'react'
import { FileDrop } from 'react-file-drop'
import { useMutation } from '@redwoodjs/web'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}
const GET_SIGNED_PUT_URL = gql`
  mutation GetSignedPutUrl($storage: String!) {
    getFileUploadURL(storage: $storage) {
      url
      name
    }
  }
`

const FileForm = (props) => {
  const [dragStatus, setDragStatus] = useState<false | 'hover' | 'loading'>(
    false
  )
  const [method, setMethod] = useState<false | 'url' | 'b64' | 'signed-put'>(
    'signed-put'
  )
  const [putURL, setPutURL] = useState('')
  const [putURLName, setPutURLName] = useState('')
  const [file, setFile] = useState<File>(undefined)
  const formMethods = useForm()

  const [getSignedPutURL] = useMutation(GET_SIGNED_PUT_URL, {
    onCompleted: (data) => {
      setPutURL(data.getFileUploadURL.url)
      setPutURLName(data.getFileUploadURL.name)
    },
  })
  const storage = formMethods.getValues()['storage']

  const getPutURL = () => {
    if (storage && method === 'signed-put' && !putURL)
      Promise.resolve(getSignedPutURL({ variables: { storage } }))
  }
  useEffect(() => {
    getPutURL()
  }, [storage, method, putURL])

  const onSubmit = async (data) => {
    if (
      method === 'signed-put' &&
      (await fetch(putURL, { method: 'PUT', body: file }))
    )
      data.from_upload = putURLName
    props.onSave(data, props?.file?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error} formMethods={formMethods}>
        {putURL}
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {props.file?.storage ? null : (
          <>
            <Label
              name="storage"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Storage
            </Label>
            <SelectField name="storage" validation={{ required: true }}>
              <option value="default">Default</option>
              <option value="test">Test</option>
            </SelectField>
            <FieldError name="storage" className="rw-field-error" />
          </>
        )}

        <Label
          name="path"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Path
        </Label>
        <TextField
          name="path"
          defaultValue={props.file?.path}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="path" className="rw-field-error" />

        <Label
          name="title"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Title
        </Label>
        <TextField
          name="title"
          defaultValue={props.file?.title}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="title" className="rw-field-error" />

        <br />

        {method !== 'url' ? (
          <FileDrop
            onDragOver={() => {
              setDragStatus('hover')
              getPutURL()
            }}
            onDragLeave={() => setDragStatus(false)}
            onDrop={(files, event) => {
              setDragStatus(false)
              setFile(files[0])
              formMethods.setValue('path', files[0].name)
              if (method === 'b64') {
                setDragStatus('loading')
                const reader = new FileReader()
                reader.readAsDataURL(files[0])
                reader.onload = function () {
                  setDragStatus(false)
                  if (reader.result) {
                    formMethods.setValue('from_b64_data', reader.result)
                  }
                }
              }
            }}
          >
            <div
              style={{
                minHeight: 20,
                width: '100%',
                padding: 8,
                border: '1px solid rgba(0,0,0,0.2)',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 8,
              }}
            >
              {dragStatus === 'loading' ? (
                '...'
              ) : (
                <h3>{!dragStatus ? 'Drag it here' : 'Drop to upload'}</h3>
              )}
            </div>
          </FileDrop>
        ) : null}

        <input
          type="radio"
          id={'radio-url'}
          onChange={() => setMethod('url')}
          checked={method === 'url'}
        />
        <label htmlFor={'radio-url'}>By URL</label>

        <input
          type="radio"
          id={'radio-b64'}
          onChange={() => setMethod('b64')}
          checked={method === 'b64'}
        />
        <label htmlFor={'radio-b64'}>File Data</label>

        <input
          type="radio"
          id={'radio-signed-put'}
          onChange={() => setMethod('signed-put')}
          checked={method === 'signed-put'}
        />
        <label htmlFor={'radio-signed-put'}>Signed PUT</label>

        {method === 'url' ? (
          <>
            <Label
              name="from_url"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              From URL
            </Label>
            <TextField
              name="from_url"
              className="rw-input"
              errorClassName="rw-input rw-input-error"
            />
            <FieldError name="from_url" className="rw-field-error" />
          </>
        ) : null}

        {method === 'b64' ? (
          <>
            <Label
              name="from_b64_data"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              From Base64 Data
            </Label>
            <TextField
              name="from_b64_data"
              className="rw-input"
              errorClassName="rw-input rw-input-error"
              disabled
            />
            <FieldError name="from_url" className="rw-field-error" />
          </>
        ) : null}

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default FileForm
