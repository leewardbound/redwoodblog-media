import * as gql from 'types/graphql'
import { requireAuth } from 'api/src/lib/auth'
import { ValidationError } from '@redwoodjs/graphql-server'
import { getStorage, putNamespaced } from 'src/lib/storage'

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
  if (data.b64_data && data.path && data.storage !== 'db') {
    console.log(
      await putNamespaced(
        getStorage(data.storage),
        context.currentUser.id,
        data.path,
        Buffer.from(data.b64_data, 'base64url').toString('binary')
      )
    )
    delete data.b64_data
  }
  return { ...data, owner: { connect: context.currentUser } }
}

/* special names "create" and "update" are only run during create/update */
export const create = (data: gql.CreateFileInput) => {
  if (!data.extension && findExtension(data))
    data.extension = findExtension(data)

  return data
}
