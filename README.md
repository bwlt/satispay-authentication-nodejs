# satispay-authentication

This is a TypeScript implementation of the [Satispay authentication](https://developers.satispay.com/reference).

## Setup

1. Copy `test.env.sample` to `test.env`
2. Fill the KEY_ID with the one generated [with the API](https://developers.satispay.com/reference#keyid)
3. Fill the PRIVATE_KEY content with your private key.  
   The `"` character wrapping the key is important; New lines should be replaced with `\n` control character.  
   Example:
   > PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nfirsLine\nsecondLine\nthirdLine\n-----END RSA PRIVATE KEY-----"