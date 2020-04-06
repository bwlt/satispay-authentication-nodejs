import fetch from 'node-fetch'
import { wrapNodeFetch } from '..'

const { KEY_ID, PRIVATE_KEY } = process.env

if (KEY_ID === undefined) throw new Error('Missing KEY_ID on environment variables')
if (PRIVATE_KEY === undefined) throw new Error('Missing KEY_ID on environment variables')

const urlStr =
  'https://staging.authservices.satispay.com/wally-services/protocol/tests'

describe('wrapNodeFetch', () => {
  it('works', async () => {
    const wrappedFetch = wrapNodeFetch({ keyId: KEY_ID, privateKey: PRIVATE_KEY })(fetch)
    const response = await wrappedFetch(urlStr)
    const json = await response.json()
    expect(json.role).toBe('ONLINE_SHOP')
  })
})
