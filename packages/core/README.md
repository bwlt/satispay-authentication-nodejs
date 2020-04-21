# @satispay-authentication/core

[![npm version](https://badge.fury.io/js/%40satispay-authentication%2Fcore.svg)](https://badge.fury.io/js/%40satispay-authentication%2Fcore)

This module will help you to [compose a signed request to Satispay API](https://developers.satispay.com/reference).  
You can also use the following implementations:

- [@satispay-authentication/node-fetch](https://www.npmjs.com/package/@satispay-authentication/node-fetch) (`node-fetch` interface)

---

# API

## HTTPRequest (interface)

An interface that represents an HTTP request.

## createSignedHTTPRequest (function)

Signature:

```Typescript
declare export function createSignedHTTPRequest(args: {
  httpRequest: HTTPRequest,
  keyId: string
  privateKey: string
}): HTTPRequest
```

Return a signed HTTPRequest.
