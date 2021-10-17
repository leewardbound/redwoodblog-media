import type { Prisma } from '@prisma/client'

import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'
import { ValidationError } from '@redwoodjs/graphql-server'

export const posts = () => {
  return db.post.findMany()
}

export const post = ({ id }: Prisma.PostWhereUniqueInput) => {
  return db.post.findUnique({
    where: { id },
  })
}

interface CreatePostArgs {
  input: Prisma.PostCreateInput
}

export const createPost = ({ input }: CreatePostArgs) => {
  requireAuth()
  return db.post.create({
    data: { ...input, owner: { connect: context.currentUser } },
  })
}

export const getPostByCurrentUser = (id: number) => {
  requireAuth()
  return db.post.findFirst({
    where: { id, owner_id: context.currentUser.id },
  })
}

interface UpdatePostArgs extends Prisma.PostWhereUniqueInput {
  input: Prisma.PostUpdateInput
}

export const updatePost = ({ id, input }: UpdatePostArgs) => {
  const post = getPostByCurrentUser(id)

  if (!post) throw new ValidationError("You don't have permission to do that")

  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost = ({ id }: Prisma.PostWhereUniqueInput) => {
  if (!getPostByCurrentUser(id))
    throw new ValidationError("You don't have permission to do that")

  return db.post.delete({
    where: { id },
  })
}

export const Post = {
  owner: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.owner_id } }),
}

export const Author = {
  posts: (_obj, { root }) => db.post.findMany({ where: { owner_id: root.id } }),
}
