import type { Prisma } from '@prisma/client'
import type { ResolverArgs } from '@redwoodjs/graphql-server'
import * as gql from 'types/graphql'

import { db } from 'src/lib/db'

import * as rules from './files.validate'
import { validateUpdate, validateCreate } from 'src/lib/validate'
import { getStorage } from 'src/lib/storage'
import { ValidationError } from '@redwoodjs/graphql-server'
import { requireAuth } from 'src/lib/auth'

export const filterCurrentUser = () => {
  requireAuth()
  return { owner_id: context.currentUser.id }
}

export const files = () => {
  return db.file.findMany()
}

export const file = ({ id }: Prisma.FileWhereUniqueInput) => {
  return db.file.findUnique({
    where: { id },
  })
}

interface CreateFileArgs {
  input: gql.CreateFileInput
}

export const createFile = async ({ input }: CreateFileArgs) => {
  return await db.file.create({
    data: { ...(await validateCreate<gql.CreateFileInput>(rules, input)) },
  })
}

interface UpdateFileArgs extends Prisma.FileWhereUniqueInput {
  input: gql.UpdateFileInput
}

export const updateFile = async ({ id, input }: UpdateFileArgs) => {
  const existing = await db.file.findFirst({
    where: { id, owner_id: context.currentUser.id },
  })
  return await db.file.update({
    data: {
      ...(await validateUpdate<
        gql.UpdateFileInput,
        Prisma.FileUpdateInput | Prisma.FileUncheckedUpdateInput
      >(rules, input, existing)),
    },
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

  const tempName = `.uploads/${new Date().toISOString()}`
  return await uploads.client.presignedPutObject(uploads.bucket, tempName)
}

export const File = {
  owner: (_obj, { root }: ResolverArgs<ReturnType<typeof file>>) =>
    db.file.findUnique({ where: { id: root.id } }).owner(),
  publicURL: async (_obj, { root }: ResolverArgs<ReturnType<typeof file>>) => {
    let seconds_until_expiry = 0
    let expired = false
    const expiryWindow = 86400 * 3
    if (root.publicURLExpires) {
      const start = new Date()
      const end = root.publicURLExpires
      seconds_until_expiry = (end.getTime() - start.getTime()) / 1000
      expired = seconds_until_expiry < expiryWindow / 3
    }
    if (!root.publicURL || expired) {
      console.log('Expired URL', expired)
      const storage = getStorage(root.storage)
      root.publicURL = await storage.getSignedFileURL(root.path)
      const validUntil = new Date(new Date().getTime() + expiryWindow * 1000)
      await db.file.update({
        data: { publicURL: root.publicURL, publicURLExpires: validUntil },
        where: { id: root.id },
      })
      console.log('Refreshed URL for', root.path, validUntil)
    } else {
      if (root.publicURLExpires) console.log('Valid for', seconds_until_expiry)
      else console.log('Public URL')
    }
    return root.publicURL
  },
}
