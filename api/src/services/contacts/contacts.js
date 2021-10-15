import { db } from 'src/lib/db'
import { UserInputError } from '@redwoodjs/graphql-server'

export const contacts = () => {
  return db.contact.findMany()
}

const validateCreateContact = (input) => {
  if (input.email && !input.email.match(/[^@]+@[^.]+\..+/)) {
    throw new UserInputError("Can't create new contact", {
      messages: {
        email: ['is not formatted like an email address'],
      },
    })
  }
}

export const createContact = ({ input }) => {
  validateCreateContact(input)
  return db.contact.create({ data: input })
}
