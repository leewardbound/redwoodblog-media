import type { Prisma } from '@prisma/client'

export const standard = defineScenario<Prisma.PostCreateArgs>({
  post: {
    one: {
      data: {
        title: 'String',
        body: 'String',
        owner: {
          create: {
            email: 'joe@test.com',
          },
        },
      },
    },
  },
})

export type StandardScenario = typeof standard
