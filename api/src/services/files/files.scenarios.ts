import type { Prisma } from '@prisma/client'

export const standard = defineScenario<Prisma.FileCreateArgs>({
  file: {
    one: {
      data: {
        storage: 'fake',
        path: 'String',
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
        path: 'String',
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
