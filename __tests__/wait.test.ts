import {expect, test} from '@jest/globals'

test('dummy', async () => {
  await expect(new Error(`error`)).toBeDefined()
})
