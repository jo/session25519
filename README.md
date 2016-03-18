# session25519

`session25519` is a public key cryptography tool for the generation of
[Curve25519](https://cr.yp.to/ecdh.html) and
[ed25519](http://ed25519.cr.yp.to) encryption and digital signature keys.

The encryption and signing keys are created with
[TweetNaCl.js](https://github.com/dchest/tweetnacl-js), a port of
[TweetNaCl](http://tweetnacl.cr.yp.to/) / [NaCl](http://nacl.cr.yp.to/) to
JavaScript for modern browsers and Node.js. The encryption keys are for the
Public-key authenticated encryption `box` construction which
implements `curve25519-xsalsa20-poly1305`. The signing keys are for the `ed25519`
digital signature system.

The strength of the system lies in the fact that the keypairs are derived from
an email address and a high-entropy passphrase and no private key files need
ever be stored to disk. The key pairs are deterministic; for any given
email and password combination the same keys will always be generated.

The code is simple, asynchronous, and uses only the fast and secure `BLAKE2s`
hash function, and `scrypt` for strong key derivation in addition to `tweetnacl-js`.

## Security

The strength of this system is very strongly tied to the strength of the
password chosen by the user. Application developers are strongly encouraged
to enforce the use of high-entropy pass phrases by users. Memorable
high-entropy pass phrases, such as can be generated with
[Diceware](https://www.rempe.us/diceware/), and measured with password strength
estimation tools like [zxcvbn](https://github.com/dropbox/zxcvbn) are critically
important to the overall security of the system.

## Usage

Simply pass in an email address and a high-entropy passphrase and an Object
with the keys will be returned. The keys returned are [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
objects which can be converted to other forms like Base64 using string conversion tools
like [Unibabel](https://github.com/coolaj86/unibabel-js) or used unchanged
by `tweetnacl-js`.

```js
session25519('me@example.com', 'brig alert rope welsh foss rang orb', function(err, keys) {
  // {
  //  publicKey: ...,
  //  secretKey: ...,
  //  publicSigningKey: ...,
  //  secretSigningKey: ...
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

The following pseudo-code illustrates how `session25519` derives keys:

```js
key               = BLAKE2s(password) // A hash of the password
salt              = email
logN              = 17   // CPU/memory cost parameter (1 to 31)
r                 = 8    // block size parameter
dkLen             = 32   // length of derived key
interruptStep     = 1000 // steps to split calculation with timeouts

encryptionKeySeed = scrypt(key, salt, logN, r, dkLen, interruptStep)
signingKeySeed    = BLAKE2s(encryptionKeySeed)

keyPair           = nacl.box.keyPair.fromSecretKey(encryptionKeySeed)
signingKeyPair    = nacl.sign.keyPair.fromSeed(signingKeySeed)
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

## Build

You can build a `dist` version of `session25519` using `browserify`. There is a pre-built version in this repository which includes all dependencies.

```sh
npm run build
```

## Test

```sh
npm run test
```
