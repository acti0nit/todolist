import {expect, test} from '@jest/globals'
import {getContent} from '../src/util'

test('should not create element for empty line', async () => {
  const content = 'test\n'
  expect(getContent(content)).toHaveLength(1)
})
