import type { Prisma } from '@prisma/client'
import type { ResolverArgs } from '@redwoodjs/graphql-server'
import { ValidationError } from '@redwoodjs/graphql-server'
import * as gql from 'types/graphql'

import { db } from 'src/lib/db'

import * as rules from './files.validate'
import { validateCreate, validateUpdate } from 'src/lib/validate'
import { getStorage } from 'src/lib/storage'
import { requireAuth } from 'src/lib/auth'

export const filterCurrentUser = () => {
  requireAuth()
  return { owner_id: context.currentUser.id }
}

export const files = () => {
  return db.file.findMany({
    where: {
      owner_id: context.currentUser?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const file = ({ id }: Prisma.FileWhereUniqueInput) => {
  return db.file.findFirst({
    where: { id, owner_id: context.currentUser.id },
  })
}

interface CreateFileArgs {
  input: gql.CreateFileInput
}

export const createFile = async ({ input }: CreateFileArgs) => {
  return await db.file.create({
    data: await validateCreate<gql.CreateFileInput>(rules, input),
  })
}

interface UpdateFileArgs extends Prisma.FileWhereUniqueInput {
  input: gql.UpdateFileInput
}

export const updateFile = async ({ id, input }: UpdateFileArgs) => {
  const existing = await db.file.findFirst({
    where: { id, owner_id: context.currentUser.id },
  })

  const data = await validateUpdate<
    gql.UpdateFileInput,
    Prisma.FileUpdateInput | Prisma.FileUncheckedUpdateInput
  >(rules, input, existing)

  return await db.file.update({
    data,
    where: { id },
  })
}

export const deleteFile = async ({ id }: Prisma.FileWhereUniqueInput) => {
  const existing = await db.file.findFirst({
    where: { ...filterCurrentUser(), id },
  })
  const storage = getStorage(existing.storage)
  if (storage && existing.path) {
    try {
      await storage.client.removeObject(storage.bucket, existing.path)
    } catch (e) {
      console.log('error deleting minio object:', e)
    }
  }

  return db.file.delete({
    where: { id },
  })
}

interface GetFileUploadURLArgs {
  storage: string
}

export const getFileUploadURL = async ({ storage }: GetFileUploadURLArgs) => {
  const uploads = getStorage(storage)
  if (!uploads) throw new ValidationError(`No such destination: ${storage}`)

  const name = `.uploads/${new Date().toISOString()}.in_progress`
  return {
    url: await uploads.client.presignedPutObject(uploads.bucket, name),
    name,
  }
}

const signedURLExpiry = 86400 * 3

export const refreshAccessURL = async (fileObj) => {
  const storage = getStorage(fileObj.storage)
  const signedAccessURL = await storage.getSignedFileURL(fileObj.path)
  const signedAccessURLExpires = new Date(
    new Date().getTime() + signedURLExpiry * 1000
  )
  await db.file.update({
    data: { signedAccessURL, signedAccessURLExpires },
    where: { id: fileObj.id },
  })
  return signedAccessURL
}

export const File = {
  owner: (_obj, { root }: ResolverArgs<ReturnType<typeof file>>) =>
    db.file.findUnique({ where: { id: root.id } }).owner(),
  publicURL: async (_obj, { root }: ResolverArgs<ReturnType<typeof file>>) => {
    let seconds_until_expiry = 0
    let expired = false

    if (root.publicURL) return root.publicURL

    if (root.signedAccessURLExpires) {
      const start = new Date()
      const end = root.signedAccessURLExpires
      seconds_until_expiry = (end.getTime() - start.getTime()) / 1000
      expired = seconds_until_expiry < signedURLExpiry / 3
    }

    if (!root.signedAccessURL || expired) {
      return await refreshAccessURL(root)
    } else {
      if (root.signedAccessURLExpires)
        console.debug('Valid for', seconds_until_expiry)
    }
    return root.signedAccessURL
  },
}
