import type { Prisma } from '@prisma/client'
import type { ResolverArgs } from '@redwoodjs/graphql-server'
import * as gql from 'types/graphql'

import { db } from 'src/lib/db'

import * as rules from './files.validate'
import { validateUpdate, validateCreate } from 'src/lib/validate'
import { getStorage } from 'src/lib/storage'
import { ValidationError } from '@redwoodjs/graphql-server'

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
  input: Prisma.FileUpdateInput
}

export const updateFile = async ({ id, input }: UpdateFileArgs) => {
  const existing = await db.file.findFirst({
    where: { id, owner_id: context.currentUser.id },
  })
  return await db.file.update({
    data: {
      ...(await validateUpdate<
        Prisma.FileUpdateInput,
        Prisma.FileUpdateInput | Prisma.FileUncheckedUpdateInput
      >(rules, input, existing)),
    },
    where: { id },
  })
}

export const deleteFile = ({ id }: Prisma.FileWhereUniqueInput) => {
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
  publicURL: (_obj, { root }): string | null => {
    const storage = getStorage(root.storage)
    return storage?.getPublicFileURL(root.path)
  },
}
