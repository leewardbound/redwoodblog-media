import * as gql from 'types/graphql'
import { requireAuth } from 'api/src/lib/auth'
import { ValidationError } from '@redwoodjs/graphql-server'
import { getStorage, putNamespaced } from 'src/lib/storage'
import * as Stream from 'stream'
import fetch from 'node-fetch'

const STORAGE_OPTIONS = ['db', 'play.minio.io']

/* Helper utility */
function findExtension(data: gql.CreateFileInput | gql.UpdateFileInput) {
  if (
    typeof data.path === 'string' &&
    data.path.length &&
    data.path.includes('.')
  ) {
    const parts = data.path.split('.')
    const lastPart = parts[parts.length - 1]
    if (lastPart.length < 6 && !lastPart.includes('/')) return lastPart
  }
  return data.extension
}

/* exported functions matching field names will validate a single field */
export const storage = (value: string) => {
  if (STORAGE_OPTIONS.includes(value)) return value
  throw new ValidationError('Unsupported storage value')
}

/* special name "root" is always run */
export const root = async (data: gql.CreateFileInput | gql.UpdateFileInput) => {
  requireAuth()
  if (data.path && data.storage !== 'db') {
    let uploadData: Buffer | Stream.Readable | string

    if (data.from_b64_data) {
      uploadData = Buffer.from(data.from_b64_data, 'base64url')
      delete data.from_b64_data
    }

    if (data.from_url) {
      uploadData = await (await fetch(data.from_url)).buffer()
      delete data.from_url
    }

    if (uploadData) {
      console.log(
        'uploaded',
        await putNamespaced(
          getStorage(data.storage),
          context.currentUser.id,
          data.path,
          uploadData
        )
      )
    }
  }
  return { ...data, owner: { connect: context.currentUser } }
}

/* special names "create" and "update" are only run during create/update */
export const create = (data: gql.CreateFileInput) => {
  if (!data.extension && findExtension(data))
    data.extension = findExtension(data)

  return data
}
