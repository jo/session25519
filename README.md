# session25519
Derive curve25519 key pair from email/password via scrypt.

## Usage
```js
session25519('me@example.com', 'brig alert rope welsh foss rang orb', function(err, key) {
  // {
  //  publicKey: ...,
  //  secretKey: ...
  // }
})
```

## Description
From [miniLock](https://github.com/kaepora/miniLock):

> Advancements in elliptic curve cryptography, specifically in systems such as
> curve25519, allow us to generate key pairs where the lengths of both public
> and private keys are relatively very small. This means that public keys become
> far easier to share (miniLock public keys, called miniLock IDs, fit inside
> less than half a tweet). This also means that a human-memorizable passphrase
> of adequate entropy can be used as the basis for deriving a private key.


## Test
```sh
npm test
```
