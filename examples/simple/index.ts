import { wrapNodeFetch } from '@satispay-authentication/node-fetch'
import nodeFetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../test.env') })

const { KEY_ID, PRIVATE_KEY } = process.env

if (KEY_ID === undefined)
  throw new Error('Missing KEY_ID on environment variables')
if (PRIVATE_KEY === undefined)
  throw new Error('Missing KEY_ID on environment variables')

const fetch = wrapNodeFetch({
  keyId: KEY_ID,
  privateKey: PRIVATE_KEY,
})(nodeFetch)

async function testSignature() {
  console.log('test signature')
  const response = await fetch(
    'https://staging.authservices.satispay.com/wally-services/protocol/tests/signature'
  )
  console.log('status:', response.status)
  console.log('body', await response.text())
}

async function createPayment() {
  console.log('create payment')
  const response = await fetch(
    'https://staging.authservices.satispay.com/g_business/v1/payments',
    {
      body: JSON.stringify({
        flow: 'MATCH_USER',
        amount_unit: 1000,
        currency: 'EUR',
        consumer_uid: '2d554614-40a2-40c5-94be-cc8fc8a894ea',
        description: 'have a nice day',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  )
  console.log('status:', response.status)
  console.log('body', await response.text())
}

async function main() {
  await testSignature()
  await createPayment()
}

main()