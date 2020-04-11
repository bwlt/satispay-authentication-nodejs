# @satispay-authentication/node-fetch

This module contains an helper function for wrapping a `node-fetch` client in order to be used with [the Satispay API](https://developers.satispay.com/reference).  
Check:

- [@satispay-authentication/core](https://www.npmjs.com/package/@satispay-authentication/core)

---

# API

## wrapNodeFetch (function)

Signature:

```Typescript
declare export function wrapNodeFetch(args: {
  keyId: string
  privateKey: string
}): typeof fetch
```

Returns a fetch function with the same API of `node-fetch`.
