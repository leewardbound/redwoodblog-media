import {
  files,
  file,
  createFile,
  updateFile,
  deleteFile,
  getFileUploadURL,
} from './files'
import type { StandardScenario } from './files.scenarios'

describe('files', () => {
  scenario('returns all files', async (scenario: StandardScenario) => {
    const result = await files()

    expect(result.length).toEqual(Object.keys(scenario.file).length)
  })

  scenario('returns a single file', async (scenario: StandardScenario) => {
    const result = await file({ id: scenario.file.one.id })

    expect(result).toEqual(scenario.file.one)
  })

  scenario('creates a db file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })

    const result = await createFile({
      input: { storage: 'db', path: 'test_image.png', b64_data: 'IMAGE_DATA' },
    })

    expect(result.owner_id).toEqual(scenario.file.one.owner_id)
    expect(result.storage).toEqual('db')
    expect(result.path).toEqual('test_image.png')
    expect(result.extension).toEqual('png')
    expect(result.b64_data).toEqual('IMAGE_DATA')
  })

  scenario('creates a db file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })

    const result = await createFile({
      input: {
        storage: 'play.minio.io',
        path: 'test_image.png',
        b64_data: 'IMAGE_DATA',
      },
    })

    expect(result.owner_id).toEqual(scenario.file.one.owner_id)
    expect(result.path).toEqual('test_image.png')
    expect(result.extension).toEqual('png')
    expect(result.b64_data).toEqual('IMAGE_DATA')
  })

  scenario('updates a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await file({ id: scenario.file.one.id })
    const result = await updateFile({
      id: original.id,
      input: { b64_data: 'IMAGE_TWO' },
    })

    expect(result.b64_data).toEqual('IMAGE_TWO')
  })

  scenario('deletes a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await deleteFile({ id: scenario.file.one.id })
    const result = await file({ id: original.id })

    expect(result).toEqual(null)
  })

  scenario('generates a presigned URL', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    jest.mock('minio')

    const result = await getFileUploadURL({
      storage: 'test',
    })

    expect(result).toContain('https://')
  })
})
