# session25519

`session25519` is a public key cryptography library for the generation of
[Curve25519](https://cr.yp.to/ecdh.html) encryption and
[ed25519](http://ed25519.cr.yp.to) digital signature keys.

The encryption and signing keys are created with
[TweetNaCl.js](https://github.com/dchest/tweetnacl-js), a port of
[TweetNaCl](http://tweetnacl.cr.yp.to/) / [NaCl](http://nacl.cr.yp.to/) to
JavaScript for modern browsers and Node.js. The encryption keys are for the
Public-key authenticated encryption `box` construction which
implements `curve25519-xsalsa20-poly1305`. The signing keys are for the `ed25519`
digital signature system.

The strength of the system lies in the fact that the keypairs are derived from
passing an email address and a high-entropy passphrase through a chain of
secure hash functions and the `scrypt` key derivation function. This means
that no private key files need ever be stored to disk. The key pairs are
deterministic; for any given user ID (email or username) and password
combination the same keys will always be generated.

The code is simple, asynchronous, and uses only the fast and
secure `BLAKE2s` and `BLAKE2b` hash functions, `scrypt` for
strong key derivation, and `NaCL` compatible encryption
and signing provided by `tweetnacl-js`.

## Security

It bears repeating that **the strength of this system is very strongly
tied to the strength of the passphrase chosen by the user**. Application
developers are **strongly encouraged** to enforce the use of
high-entropy pass phrases by users. Memorable high-entropy pass phrases,
such as can be generated with [Diceware](https://www.rempe.us/diceware/),
and measured with password strength estimation tools like
[zxcvbn](https://github.com/dropbox/zxcvbn) are critically important to
the overall security of the system.

## Version `v1` versus `v2`

There are two versions of this function that you can call, `v1` and `v2`. `v1` is
the original version (before there was a version). If you are upgrading from
version `1.x.x` of this package you will want to specify the `v1` arg.  If you
do not, the keys generated will not be the same deterministic keypair you would
expect for a given user ID and password. If you specify `v1`, which is backwards
compatible, everything should behave identically to before.

The new `v2` version enhances the security of the system, and provides an
additional key pair. The hash of the password is now a 64 Byte (vs. 32B in v1)
`BLAKE2b` hash (vs. `BLAKE2s` in `v1`). This hash is alse keyed, like an HMAC,
with the BLAKE2b hash of the email and version args passed as a key to the
password hashing function.

The `scrypt` key derivation function in `v2` will now also return 64 Bytes
of derived key material (vs. 32B in `v1`). The first 32B are used to seed the
`nacl.box.keyPair.fromSecretKey()` function, and the second 32B are used to seed
the `nacl.sign.keyPair.fromSeed()` function. So now you get two full sets of keys
returned.  One for encryption, and one for digital signatures. These keys are all
returned as `Uint8Array` objects and can be used directly by TweetNaCL.js.
For convenience, a Base64 encoded version of each key is also returned
in the Object Literal.

## Usage

Simply pass in a user identifier, such as an email address, and a high-entropy
passphrase and an Object Literal with the keys will be returned. The keys
returned are [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
objects.

### Version 1 (Legacy) Output

You must pass the `v1` arg as the last arg after the callback.

```js
session25519('me@example.com', 'brig alert rope welsh foss rang orb', function(err, keys) {
  // {
  //   publicKey: ...,
  //   secretKey: ...
  // }
}, 'v1')
```

### Version 2 (Default) Output

You can optionally pass the `v2` arg as the last arg after the callback. If no
arg is passed it will default to `v2`.

```js
session25519('me@example.com', 'brig alert rope welsh foss rang orb', function(err, keys) {
  // {
  //   publicBoxKey: ...,
  //   publicBoxKeyBase64: ...,
  //   secretBoxKey: ...,
  //   secretBoxKeyBase64: ...,
  //   publicSignKey: ...,
  //   publicSignKeyBase64: ...,
  //   secretSignKey: ...,
  //   secretSignKeyBase64: ...
  // }
}, 'v2')
```


## Crypto Description

From [miniLock](https://github.com/kaepora/miniLock):

> Advancements in elliptic curve cryptography, specifically in systems such as
> Curve25519, allow us to generate key pairs where the lengths of both public
> and private keys are relatively very small. This means that public keys become
> far easier to share (miniLock public keys, called miniLock IDs, fit inside
> less than half a tweet). This also means that a human-memorizable passphrase
> of adequate entropy can be used as the basis for deriving a private key.

The following pseudo-code illustrates how `session25519` derives keys:

### `v1`

```js
key               = BLAKE2s(password) // A 32 Byte hash of the password
salt              = email
logN              = 17   // CPU/memory cost parameter (1 to 31)
r                 = 8    // block size parameter
dkLen             = 32   // length of derived key

// 32 Byte key material
encryptionKeySeed = scrypt(key, salt, logN, r, dkLen)
keyPair           = nacl.box.keyPair.fromSecretKey(encryptionKeySeed)
```

### `v2`

```js
// A 64 Byte hash of the password keyed w/ a 64 Byte hash of args
key               = BLAKE2b(password, BLAKE2b(email, version))
salt              = email
logN              = 17   // CPU/memory cost parameter (1 to 31)
r                 = 8    // block size parameter
dkLen             = 64   // length of derived key

// 64 Byte key material
derivedBytes      = scrypt(key, salt, logN, r, dkLen)

// Split the 64 Bytes of key material into two 32 Byte arrays
encryptKeySeed    = derivedBytes[0, 32]
signKeySeed       = derivedBytes[32, 64]

keyPair           = nacl.box.keyPair.fromSecretKey(encryptKeySeed) // 32 Byte seed
signingKeyPair    = nacl.sign.keyPair.fromSeed(signKeySeed) // 32 Byte seed
```

## Performance

The author of [scrypt-async-js](https://github.com/dchest/scrypt-async-js),
which is the strong key derivation mechanism used by `session25519`, [recommends](https://github.com/dchest/scrypt-async-js/commit/ac57f235b505eb3f4fa8f2f95ae22d7eddd655d5)
using `setImmediate`:

> Using `setImmediate` massively improves performance. Since
> most browsers don't support it, you'll have to include a
> shim for it.

- [YuzuJS/setImmediate](https://github.com/YuzuJS/setImmediate)
- [setImmediate shim demo](http://jphpsf.github.io/setImmediate-shim-demo/)
- [caniuse setImmediate](http://caniuse.com/#search=setImmediate)

## Resources

### BLAKE.js
- Origin: https://github.com/dcposch/blakejs
- License: Creative Commons CC0

### scrypt-async-js
- Origin: https://github.com/dchest/scrypt-async-js
- License: BSD-like, see LICENSE file or MIT license at your choice.

### TweetNaCl.js
- Origin: https://github.com/dchest/tweetnacl-js
- License: Public Domain

### tweetnacl-util-js
- Origin: https://github.com/dchest/tweetnacl-util-js
- License: Public Domain

### base64-js
- Origin: https://github.com/beatgammit/base64-js
- License: MIT

## Build

You can build a `dist` version of `session25519` using `browserify`. There is a
pre-built version in the `dist` directory of this repository which includes
all dependencies and can be used with a `<script>` tag in the browser.

```sh
npm run build
```

## Test

```sh
npm run test
```
