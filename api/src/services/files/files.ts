import type { Prisma } from '@prisma/client'
import type { ResolverArgs } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

import * as rules from './files.validate'
import { validateUpdate, validateCreate } from 'src/lib/validate'

export const files = () => {
  return db.file.findMany()
}

export const file = ({ id }: Prisma.FileWhereUniqueInput) => {
  return db.file.findUnique({
    where: { id },
  })
}

interface CreateFileArgs {
  input: Prisma.FileCreateInput
}

export const createFile = ({ input }: CreateFileArgs) => {
  return db.file.create({
    data: { ...validateCreate<Prisma.FileCreateInput>(rules, input) },
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
      ...validateUpdate<Prisma.FileUpdateInput>(rules, input, existing),
    },
    where: { id },
  })
}

export const deleteFile = ({ id }: Prisma.FileWhereUniqueInput) => {
  return db.file.delete({
    where: { id },
  })
}

export const File = {
  owner: (_obj, { root }: ResolverArgs<ReturnType<typeof file>>) =>
    db.file.findUnique({ where: { id: root.id } }).owner(),
}
