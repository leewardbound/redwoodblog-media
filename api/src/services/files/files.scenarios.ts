import type { Prisma } from '@prisma/client'
import { v4 as uuid } from 'uuid'

export const standard = defineScenario<Prisma.FileCreateArgs>({
  file: {
    one: {
      data: {
        storage: 'fake',
        path: uuid(),
        owner: {
          create: {
            email: 'String1886021',
            hashedPassword: 'String',
            salt: 'String',
          },
        },
      },
    },
    two: {
      data: {
        storage: 'fake',
        path: uuid(),
        owner: {
          create: {
            email: 'String4375901',
            hashedPassword: 'String',
            salt: 'String',
          },
        },
      },
    },
  },
})

export type StandardScenario = typeof standard
