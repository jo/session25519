# session25519

A tool to derive a strong [Curve25519](https://cr.yp.to/ecdh.html)
`NaCL` public key cryptography key pair from an email address and a
high-entropy passphrase. Makes use of the `BLAKE2s` hash function,
`scrypt` for key derivation, and the derived key is used to generate a `tweetnacl-js` key pair. The key pair is deterministic; for any given username/password combination the same keys will always be created.
This creates a cryptographic system where it is no longer necessary to
manage and secure private key files or transfer them between systems.

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
> Curve25519, allow us to generate key pairs where the lengths of both public
> and private keys are relatively very small. This means that public keys become
> far easier to share (miniLock public keys, called miniLock IDs, fit inside
> less than half a tweet). This also means that a human-memorizable passphrase
> of adequate entropy can be used as the basis for deriving a private key.

The following pseudo-code illustrates how `session25519` derives `NaCL` keys
using strong cryptographic functions:

```js
key           = BLAKE2s(password) // A hash of the password
salt          = email
logN          = 17   // CPU/memory cost parameter (1 to 31)
r             = 8    // block size parameter
dkLen         = 32   // length of derived key
interruptStep = 1000 // steps to split calculation with timeouts

derivedKey    = scrypt(key, salt, logN, r, dkLen, interruptStep)
keyPair       = nacl.box.keyPair.fromSecretKey(derivedKey)
```

## Performance

The author of [scrypt-async-js](https://github.com/dchest/scrypt-async-js), which is the strong key derivation mechanism used by `session25519`, [recommends](https://github.com/dchest/scrypt-async-js/commit/ac57f235b505eb3f4fa8f2f95ae22d7eddd655d5) using `setImmediate`:

> Using `setImmediate` massively improves performance. Since
> most browsers don't support it, you'll have to include a
> shim for it, as we don't provide any.

- [YuzuJS/setImmediate](https://github.com/YuzuJS/setImmediate)
- [setImmediate shim demo](http://jphpsf.github.io/setImmediate-shim-demo/)
- [caniuse setImmediate](http://caniuse.com/#search=setImmediate)

## Resources

### BLAKE2s-js
- Origin: https://github.com/dchest/blake2s-js
- License: Public domain

### scrypt-async-js
- Origin: https://github.com/dchest/scrypt-async-js
- License: BSD-like, see LICENSE file or MIT license at your choice.

### TweetNaCl.js
- Origin: https://github.com/dchest/tweetnacl-js
- License: Public Domain

## Test

```sh
npm test
```
