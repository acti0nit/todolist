import {expect, test} from '@jest/globals'
import {getChanges, getContent} from '../src/util'

test('should not create element for empty line', async () => {
  const content = 'test\n'
  expect(getContent(content)).toHaveLength(1)
})

test('should return correct input from patch', async () => {
  const content =
    '@@ -1 +1,2 @@\n feat:create issue from todo file\n+feat:create issue from todo in comments'
  const {label, title} = getChanges(content)
  expect(label).toBe('feat')
  expect(title).toBe('create issue from todo in comments')
})
