import { expect, test } from '@jest/globals'
import { getChanges, getContent } from '../src/util'

test('should not create element for empty line', async () => {
  const content = 'test\n'
  expect(getContent(content)).toHaveLength(1)
})

test('should return correct input from patch', async () => {
  const content =
    '@@ -1 +1,2 @@\n feat:create issue from todo file\n+feat:create issue from todo in comments'
  const changes = getChanges(content)
  expect(changes).toHaveLength(1)
  expect(changes[0].label).toBe('feat')
  expect(changes[0].title).toBe('create issue from todo in comments')
})

test('should return correct input from patch with 2 issues', async () => {
  console.log('test debugging')
  const content =
    '@@ -1 +1,3 @@\n feat:create issue from todo file\n+feat:create issue from todo in comments\n+feat:add more labels'
  const changes = getChanges(content)
  console.log(`changes: ${JSON.stringify(changes, null, 2)}`)
  expect(changes).toHaveLength(2)
  expect(changes[0].label).toBe('feat')
  expect(changes[0].title).toBe('create issue from todo in comments')
  expect(changes[1].label).toBe('feat')
  expect(changes[1].title).toBe('add more labels')
})
