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
import { getStorage } from 'src/lib/storage'

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
    expect(result.path).toEqual(`${result.owner_id}/test_image.png`)
    expect(result.extension).toEqual('png')
    expect(result.title).toEqual('Image One')
  })

  scenario('updates a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await file({ id: scenario.file.one.id })
    const result = await updateFile({
      id: original.id,
      input: { title: 'IMAGE_TWO', path: 'IMAGE_TWO.jpg' },
    })

    expect(result.title).toEqual('IMAGE_TWO')
    expect(result.path).toEqual(`${result.owner_id}/IMAGE_TWO.jpg`)
    expect(result.extension).toEqual('jpg')
  })

  scenario('deletes a file', async (scenario: StandardScenario) => {
    mockCurrentUser({ id: scenario.file.one.owner_id })
    const original = await deleteFile({ id: scenario.file.one.id })
    const result = await file({ id: original.id })

    expect(result).toEqual(null)
  })
})

const maybe = (predicate: () => boolean, name: string, fn: () => void) =>
  predicate() ? describe(name, fn) : describe.skip(name, fn)
maybe(
  () => Boolean(process.env.TEST_MINIO),
  'files-minio',
  () => {
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
        expect(result.path).toEqual(`${result.owner_id}/test-ok.png`)
        expect(result.extension).toEqual('png')
        const publicBase = getStorage(result.storage).publicURL
        if (publicBase)
          expect(result.publicURL.startsWith(publicBase)).toEqual(true)
        else expect(result.publicURL).toEqual(null)
      }
    )
    scenario(
      'creates a minio file from http url',
      async (scenario: StandardScenario) => {
        mockCurrentUser({ id: scenario.file.one.owner_id })

        const result = await createFile({
          input: {
            storage: 'test',
            path: 'test-150.png',
            from_url: 'https://via.placeholder.com/150',
          },
        })

        expect(result.owner_id).toEqual(scenario.file.one.owner_id)
        expect(result.path).toEqual(`${result.owner_id}/test-150.png`)
        expect(result.extension).toEqual('png')
        const publicBase = getStorage(result.storage).publicURL
        if (publicBase)
          expect(result.publicURL.startsWith(publicBase)).toEqual(true)
        else expect(result.publicURL).toEqual(null)
      }
    )

    scenario(
      'moves a minio file when path changes',
      async (scenario: StandardScenario) => {
        mockCurrentUser({ id: scenario.file.one.owner_id })

        const created = await createFile({
          input: {
            storage: 'test',
            path: 'test.txt',
            from_b64_data: 'TEST DATA',
          },
        })

        const updated = await updateFile({
          id: created.id,
          input: {
            path: 'test2.txt',
          },
        })

        expect(updated.path).toEqual(`${created.owner_id}/test2.txt`)
        expect(created.id).toEqual(updated.id)
      }
    )
  }
)
