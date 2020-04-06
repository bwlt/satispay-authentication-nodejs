import fetch from 'node-fetch'
import {
  generateAutorizationHeader,
  generateDigestHeader,
  generateSignature,
  generateSignatureString,
} from '../lib'
import { HTTPRequest, createSignedHTTPRequest } from '..'

const { KEY_ID, PRIVATE_KEY } = process.env

if (KEY_ID === undefined) throw new Error('Missing KEY_ID on environment variables')
if (PRIVATE_KEY === undefined) throw new Error('Missing KEY_ID on environment variables')

const urlStr =
  'https://staging.authservices.satispay.com/wally-services/protocol/tests'

describe('generateAutorizationHeader', () => {
  it('should work', () => {
    const [name, value] = generateAutorizationHeader({
      keyId: KEY_ID,
      headers: [
        ['host', 'example.com'],
        ['date', 'Tue, 07 Jun 2014 20:51:35 GMT'],
        ['digest', 'SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE='],
      ],
      signature:
        'ATp0r26dbMIxOopqw0OfABDT7CKMIoENumuruOtarj8n/97Q3htHFYpH8yOSQk3Z5zh8UxUym6FYTb5+A0Nz3NRsXJibnYi7brE/4tx5But9kkFGzG+xpUmimN4c3TMN7OFH//+r8hBf7BT9/GmHDUVZT2JzWGLZES2xDOUuMtA=',
    })
    expect(name).toBe('authorization')
    expect(value).toBe(
    `Signature keyId="${KEY_ID}", algorithm="rsa-sha256", headers="(request-target) host date digest", signature="ATp0r26dbMIxOopqw0OfABDT7CKMIoENumuruOtarj8n/97Q3htHFYpH8yOSQk3Z5zh8UxUym6FYTb5+A0Nz3NRsXJibnYi7brE/4tx5But9kkFGzG+xpUmimN4c3TMN7OFH//+r8hBf7BT9/GmHDUVZT2JzWGLZES2xDOUuMtA="`
    )
  })
})

describe('generateSignatureString', () => {
  it('should work', () => {
    const result = generateSignatureString({
      method: 'GET',
      path: '/foo',
      headers: [
        ['host', 'example.org'],
        ['date', 'Tue, 07 Jun 2014 20:51:35 GMT'],
        ['x-example', 'Example header with some whitespace.'],
      ],
    })
    expect(result).toBe(
      '(request-target): get /foo' +
        '\n' +
        'host: example.org' +
        '\n' +
        'date: Tue, 07 Jun 2014 20:51:35 GMT' +
        '\n' +
        'x-example: Example header with some whitespace.'
    )
  })
})

describe('generateSignature', () => {
  it('should work', () => {
    const signatureString =
      '(request-target): post /foo?param=value&pet=dog' +
      '\n' +
      'host: example.com' +
      '\n' +
      'date: Mon, 30 Nov 2015 15:19:40 GMT' +
      '\n' +
      'content-type: application/json' +
      '\n' +
      'digest: SHA-256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=' +
      '\n' +
      'content-length: 18'
    const result = generateSignature({
      signatureString,
      privateKey: PRIVATE_KEY,
    })
    expect(result).toBe(
      'd/+UpUwMoIQ6pHyJlYW1OMEhVJFN/p6tjQEowQRIbmh2kQ1ETMLn14+p9vxuH4mTzwo2QfJXYkGKQOb0+Qppb19fkZNgtnNs/59CYLNkdyk2b2VCyAQJWbV84tDppWLWmX2Xg0TTOc1w1J0xEWsFuCGTxLEJi1hoR2T2RoquHTpn6jlMhV96hJTJ/xmn+ndf13meKgdK0Fty3zU0b1+UwbH2ZNFwkM3LKUoEHztUDzRbAA+qQY5WvZ1atTIIngpZLaiQuMsRpvR9VS2AAkWKWzyM7fKgVubvaoUvIz79SttWsKPAVgzyAEndp+y+7mti10dgDjQ0oO8cWnlZFukJA+eA/T2TLyrqSuMXvi37TZ5hMQ56EREFFIw5bbo2UouoL/w/QBb2llxpQ5YSqNA9EKMf0FDcd+NvgusCuaHBcmziNieoAJA+6AcF7O3SjjEbXsZdu6nvpLcagelOm49G72llCf4IFfWY8F5V1EXa65uV4i7ax+3Wvy3Xrt20MS9ZRAPvvw4TFSXp484Wu1o1pPxHXpkramB6ysvgueomGA0XNeRxd++rrMT25q1IeNSL6MgmmqSZwMiZiWEXuejmYokUB0SdsKz/TEdRmGp/WWG4wq4BXl6GXfPMHEoEansNTJwyYzCI13Dz/SZcgugB2F7eNK2nZ4gWY06Dtzfy5uU='
    )
  })
})

describe('generateDigestHeader', () => {
  it('should work', () => {
    const result = generateDigestHeader({ body: '' })
    expect(result[0]).toBe('digest')
    expect(result[1]).toBe(
      'SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
    )
  })

  it('should work with a payload', () => {
    const result = generateDigestHeader({
      body:
        '{\n"flow": "MATCH_CODE",\n"amount_unit": 100,\n"currency": "EUR"\n}',
    })
    expect(result[0]).toBe('digest')
    expect(result[1]).toBe(
      'SHA-256=UJbgOTxTpWJ11B11wnufAZ9Ead5wjfU6uIIB82bG4lg='
    )
  })
})

describe('createSignedHTTPRequest', () => {
  it('should work', () => {
    const request: HTTPRequest = {
      method: 'get',
      url: 'https://example.com/lol',
      headers: [['x-pippo', 'pluto']],
    }
    const signed = createSignedHTTPRequest({
      httpRequest: request,
      keyId: KEY_ID,
      privateKey: PRIVATE_KEY,
    })
    expect(signed.method).toBe('get')
    expect(signed.url).toBe('https://example.com/lol')
    expect(signed.headers).toHaveLength(5)
    expect(signed.headers[0][0]).toBe('x-pippo')
    expect(signed.headers[0][1]).toBe('pluto')
    expect(signed.headers[1][0]).toBe('host')
    expect(signed.headers[1][1]).toBe('example.com')
    expect(signed.headers[2][0]).toBe('date')
    expect(signed.headers[2][1]).toBeDefined()
    expect(signed.headers[3][0]).toBe('digest')
    expect(signed.headers[3][1]).toBeDefined()
    expect(signed.headers[4][0]).toBe('authorization')
    expect(signed.headers[4][1]).toEqual(
      expect.stringContaining(
        `Signature keyId="${KEY_ID}", algorithm="rsa-sha256", headers="(request-target) x-pippo host date digest", signature=`
      )
    )
  })
})

describe('request', () => {
  it('should work', async () => {
    const signed = createSignedHTTPRequest({
      httpRequest: {
        method: 'get',
        headers: [],
        url: urlStr,
      },
      keyId: KEY_ID,
      privateKey: PRIVATE_KEY,
    })
    const headers = signed.headers.reduce(
      (acc, [name, value]) => ({ ...acc, [name]: value }),
      {}
    )
    const response = await fetch(urlStr, { headers })
    expect(response.status).toBe(200)
    const jsonBody = await response.json()
    expect(jsonBody.role).not.toBe('PUBLIC')
  })

  it('should work with post', async () => {
    const signed = createSignedHTTPRequest({
      httpRequest: {
        body: JSON.stringify({ hello: 'world' }),
        method: 'post',
        headers: [['content-type', 'application/json']],
        url: urlStr,
      },
      keyId: KEY_ID,
      privateKey: PRIVATE_KEY,
    })
    const headers = signed.headers.reduce(
      (acc, [name, value]) => ({ ...acc, [name]: value }),
      {}
    )
    const response = await fetch(urlStr, {
      headers,
      method: 'post',
      body: signed.body,
    })
    expect(response.status).toBe(200)
    const jsonBody = await response.json()
    expect(jsonBody.authentication_key.role).not.toBe('PUBLIC')
  })
})
