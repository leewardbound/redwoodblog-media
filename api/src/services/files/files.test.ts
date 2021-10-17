import {
  files,
  file,
  createFile,
  updateFile,
  deleteFile,
  getFileUploadURL,
} from './files'
import type { StandardScenario } from './files.scenarios'
import { promises as fs } from 'fs'

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
      input: { storage: 'db', path: 'test_image.png', title: 'Image One' },
    })

    expect(result.owner_id).toEqual(scenario.file.one.owner_id)
    expect(result.storage).toEqual('db')
    expect(result.path).toEqual('test_image.png')
    expect(result.extension).toEqual('png')
    expect(result.title).toEqual('Image One')
  })

  scenario('updates a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await file({ id: scenario.file.one.id })
    const result = await updateFile({
      id: original.id,
      input: { title: 'IMAGE_TWO' },
    })

    expect(result.title).toEqual('IMAGE_TWO')
  })

  scenario('deletes a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await deleteFile({ id: scenario.file.one.id })
    const result = await file({ id: original.id })

    expect(result).toEqual(null)
  })
})

describe('files-minio', () => {
  scenario(
    'generates a presigned upload URL',
    async (scenario: StandardScenario) => {
      mockCurrentUser({ id: scenario.file.one.owner_id })
      jest.mock('minio')

      const result = await getFileUploadURL({
        storage: 'test',
      })

      expect(result).toContain('https://')
    }
  )

  scenario(
    'creates a minio file from base64 data',
    async (scenario: StandardScenario) => {
      mockCurrentUser({ id: scenario.file.one.owner_id })
      const data = await fs.readFile(__dirname + '/test-ok.png', 'binary')
      const from_b64_data = Buffer.from(data, 'binary').toString('base64url')

      const result = await createFile({
        input: {
          storage: 'test',
          path: 'test-ok.png',
          from_b64_data,
        },
      })

      expect(result.owner_id).toEqual(scenario.file.one.owner_id)
      expect(result.path).toEqual('test-ok.png')
      expect(result.extension).toEqual('png')
      expect(result.publicURL).toEqual(null)
    }
  )
})
