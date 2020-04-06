import crypto from 'crypto'
import url from 'url'
import { HTTPRequest, Header } from './types'

export function generateAutorizationHeader({
  keyId,
  headers,
  signature,
}: {
  keyId: string
  headers: Header[]
  signature: string
}): Header {
  const headerNamesList = headers.map((h) => h[0].toLowerCase()).join(' ')
  const headerName = 'authorization'
  const headerValue = [
    `Signature keyId="${keyId}"`,
    'algorithm="rsa-sha256"',
    `headers="(request-target) ${headerNamesList}"`,
    `signature="${signature}"`,
  ].join(', ')
  return [headerName, headerValue]
}

export function generateDigestHeader(
  { body }: { body: string } = { body: '' }
): Header {
  const digest = crypto.createHash('sha256').update(body).digest('base64')
  return ['digest', `SHA-256=${digest}`]
}

export function generateSignatureString({
  method,
  path,
  headers,
}: {
  method: string
  path: string
  headers: Header[]
}): string {
  return [
    `(request-target): ${method.toLowerCase()} ${path}`,
    ...headers.map(([name, value]) => `${name}: ${value}`),
  ].join('\n')
}

export function generateSignature({
  privateKey,
  signatureString,
}: {
  privateKey: string
  signatureString: string
}): string {
  return crypto
    .createSign('RSA-SHA256')
    .update(signatureString)
    .sign(privateKey, 'base64')
}

export function createSignedHTTPRequest({
  httpRequest,
  keyId,
  privateKey,
}: {
  httpRequest: HTTPRequest
  keyId: string
  privateKey: string
}): HTTPRequest {
  const method = httpRequest.method.toLowerCase()
  const parsedUrl = url.parse(httpRequest.url)
  if (!parsedUrl.host) throw new Error(`Missing 'host' in httpRequest.url.`)
  if (!parsedUrl.pathname)
    throw new Error(`Missing 'pathname' in httpRequest.url.`)
  const headers: Header[] = [
    ...httpRequest.headers,
    ['host', parsedUrl.host],
    ['date', new Date().toUTCString()],
    generateDigestHeader({ body: httpRequest.body || '' }),
  ].map(([name, value]) => [name.toLowerCase(), value])
  const signatureString = generateSignatureString({
    method,
    path: parsedUrl.pathname,
    headers,
  })
  const signature = generateSignature({ privateKey, signatureString })
  const [
    authorizationHeaderName,
    authorizationHeaderValue,
  ] = generateAutorizationHeader({
    keyId,
    headers,
    signature,
  })
  const headersWithAuth: Header[] = [
    ...headers,
    [authorizationHeaderName, authorizationHeaderValue],
  ]

  return {
    method,
    url: httpRequest.url,
    headers: headersWithAuth,
    body: httpRequest.body,
  }
}
