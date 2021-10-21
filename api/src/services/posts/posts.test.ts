import { createPost, deletePost, post, posts, updatePost } from './posts'
import type { StandardScenario } from './posts.scenarios'
import { mockUserID } from 'src/lib/test_helpers'

describe('posts', () => {
  scenario('returns all posts', async (scenario: StandardScenario) => {
    const result = await posts()

    expect(result.length).toEqual(Object.keys(scenario.post).length)
  })

  scenario('returns a single post', async (scenario: StandardScenario) => {
    const result = await post({ id: scenario.post.one.id })

    expect(result).toEqual(scenario.post.one)
  })

  scenario('creates a post', async (scenario: StandardScenario) => {
    mockUserID(scenario.post.one.owner_id)
    const result = await createPost({
      input: { title: 'String', body: 'String' },
    })

    expect(result.title).toEqual('String')
    expect(result.body).toEqual('String')
    expect(result.owner_id).toEqual(scenario.post.one.owner_id)
  })

  scenario('updates a post', async (scenario: StandardScenario) => {
    mockUserID(scenario.post.one.owner_id)

    const original = await post({ id: scenario.post.one.id })
    const result = await updatePost({
      id: original.id,
      input: { title: 'String2' },
    })

    expect(result.title).toEqual('String2')
  })

  scenario('deletes a post', async (scenario: StandardScenario) => {
    mockUserID(scenario.post.one.owner_id)

    const original = await deletePost({ id: scenario.post.one.id })
    const result = await post({ id: original.id })

    expect(result).toEqual(null)
  })
})
