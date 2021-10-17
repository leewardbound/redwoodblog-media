import * as gql from 'types/graphql'
import { ValidationError } from '@redwoodjs/graphql-server'
import { getStorage } from 'src/lib/storage'
import { requireAuth } from 'src/lib/auth'
import * as Stream from 'stream'
import fetch from 'node-fetch'
import { Prisma } from '@prisma/client'

const STORAGE_OPTIONS = ['test']

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
  if (STORAGE_OPTIONS.includes(value) || value === 'db') return value
  throw new ValidationError('Unsupported storage value')
}

export const path = (value: string) => {
  const userNamespace = `${context.currentUser.id}/`
  if (!value.startsWith(userNamespace)) return `${userNamespace}${value}`
  return value
}

/* special name "root" is always run */
export const root = async (
  data: gql.CreateFileInput | gql.UpdateFileInput,
  existing?: Prisma.FileUncheckedUpdateInput
) => {
  requireAuth()
  let publicURL: string = undefined

  // storage is required on create, but readonly for updates
  const storage =
    (existing?.storage as string) || (data as gql.CreateFileInput).storage

  if (data.path && storage !== 'db') {
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
      const driver = getStorage(storage)
      await driver.client.putObject(driver.bucket, data.path, uploadData)
      if (driver.publicURL) publicURL = driver.getPublicFileURL(data.path)
    }
  }
  return { ...data, storage, publicURL, owner_id: context.currentUser.id }
}

/* special names "create" and "update" are only run during create/update */
export const create = (data: gql.CreateFileInput) => {
  if (!data.extension && findExtension(data))
    data.extension = findExtension(data)

  return data
}

export const update = async (
  data: gql.UpdateFileInput,
  existing: Prisma.FileUncheckedUpdateInput | Prisma.FileUpdateInput
) => {
  if (data.path && !data.extension && findExtension(data))
    data.extension = findExtension(data)

  if (existing.path && data.path !== existing.path) {
    const storage = getStorage(existing.storage as string)
    if (storage) {
      if (data.path) {
        console.log(
          storage.bucket,
          'File move requested:',
          existing.path,
          '=>',
          data.path
        )
        await storage.client.copyObject(
          storage.bucket,
          existing.path as string,
          data.path,
          null
        )
        await storage.client.removeObject(
          storage.bucket,
          existing.path as string
        )
      } else {
        throw new ValidationError(
          'Path is required for existing files, maybe you wanted to deleteFile?'
        )
      }
    }
  }

  return data
}
