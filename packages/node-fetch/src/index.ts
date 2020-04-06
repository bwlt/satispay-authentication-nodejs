import fetch, {
  RequestInfo,
  RequestInit,
  Headers,
  BodyInit,
  Response,
  Request,
} from 'node-fetch'
import {
  Header,
  createSignedHTTPRequest,
  HTTPRequest,
} from '@satispay-authentication/core'

type FetchFn = typeof fetch

function toString(a: BodyInit): string {
  if (typeof a === 'string') {
    return a
  } else {
    throw new Error('Unimplemented')
  }
}

interface URLLike {
  href: string
}

function foldRequestInfo<R>(matchers: {
  whenRequest: (request: Request) => R
  whenString: (str: string) => R
  whenURLLike: (urlLike: URLLike) => R
}): (requestInfo: RequestInfo) => R {
  return (requestInfo) => {
    if (typeof requestInfo === 'string') {
      return matchers.whenString(requestInfo)
    } else if ('href' in requestInfo) {
      return matchers.whenURLLike(requestInfo)
    } else {
      return matchers.whenRequest(requestInfo)
    }
  }
}

export const wrapNodeFetch = ({
  keyId,
  privateKey,
}: {
  keyId: string
  privateKey: string
}) => (nodeFetch: FetchFn): FetchFn => {
  const fetchHeadersToHeadersList = (fh: Headers): Header[] => {
    const list: Header[] = []
    fh.forEach((value: string, name: string) => list.push([name, value]))
    return list
  }

  const buildSignedFetchHeaders = (headers: Header[]): Headers => {
    const fetchHeaders = new Headers()
    for (const [name, value] of headers) {
      fetchHeaders.append(name, value)
    }
    return fetchHeaders
  }

  return Object.assign(
    function wrapped(url: RequestInfo, init?: RequestInit): Promise<Response> {
      const fetchHeaders = new Headers(init?.headers)
      const method = init?.method ? init.method : 'get'
      const urlStr = foldRequestInfo({
        whenRequest: (r) => r.url,
        whenString: (s) => s,
        whenURLLike: (u) => u.href,
      })(url)
      const headers = fetchHeadersToHeadersList(fetchHeaders)
      const httpRequest: HTTPRequest = {
        method,
        url: urlStr,
        headers,
        body: init?.body ? toString(init.body) : undefined,
      }
      const signed = createSignedHTTPRequest({
        httpRequest,
        keyId,
        privateKey,
      })
      const signedFetchHeaders = buildSignedFetchHeaders(signed.headers)

      return nodeFetch(url, {
        ...init,
        headers: signedFetchHeaders,
      })
    },
    { isRedirect: nodeFetch.isRedirect }
  )
}
