import * as gql from 'types/graphql'
import { requireAuth } from 'src/lib/auth'
import { ValidationError } from '@redwoodjs/graphql-server'

function findExtension(data: gql.CreateFileInput | gql.UpdateFileInput) {
  if (
    typeof data.path === 'string' &&
    data.path.length &&
    !data.extension &&
    data.path.includes('.')
  ) {
    const parts = data.path.split('.')
    const lastPart = parts[parts.length - 1]
    if (lastPart.length < 6) return lastPart
  }
  return data.extension
}

export const storage = (value: string) => {
  if (value === 'db') return value
  throw new ValidationError('Unsupported storage value')
}

export const create = (data: gql.CreateFileInput) => {
  requireAuth()

  data.extension = findExtension(data)

  return { ...data, owner: { connect: context.currentUser } }
}

export const update = (data: gql.CreateFileInput) => {
  requireAuth()

  data.extension = findExtension(data)

  return { ...data, owner: { connect: context.currentUser } }
}
