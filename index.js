var blake = require('blakejs')
var scrypt = require('scrypt-async')
var nacl = require('tweetnacl')
var base64 = require('base64-js')

// Code inspired by:
// https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js

// Extracted from tweetnacl-util-js
// https://github.com/dchest/tweetnacl-util-js/blob/master/nacl-util.js#L16
function decodeUTF8 (s) {
  var i, d = unescape(encodeURIComponent(s)), b = new Uint8Array(d.length)
  for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i)
  return b
}

// Input:
//   key                      // User key hash (Uint8Array)
//   salt                     // Salt (email or username) (Uint8Array)
//   logN              = 17   // CPU/memory cost parameter (Integer 1 to 31)
//   r                 = 8    // Block size parameter
//   dkLen             = 32   // Length of derived key (32 or 64)
//   interruptStep     = 1000 // Steps to split calculation with timeouts
//   callback function
//
// Result:
//   Returns 32 bytes of scrypt derived key material in an Array,
//   which is then passed to the callback.
//
function getScryptKey (key, salt, logN, r, dkLen, interruptStep, callback) {
  'use strict'

  scrypt(key, salt, logN, r, dkLen, interruptStep, function (keyBytes) {
    return callback(keyBytes)
  }, null)
}

// Input:
//  email       // A UTF-8 username or email
//  password    // A UTF-8 passphrase
//  callback    // A callback function
//  version     // A string function version, v1 (legacy), v2 current.
//
// Result:
//   An object literal with keys
//
module.exports = function session (email, password, callback, version) {
  'use strict'

  var scryptKey, dkLen

  // set the default version to the newer and more secure one
  // developers who are upgrading will need to specify v1 to keep
  // old behaviors.
  if (version === undefined) version = 'v2'

  // The output length desired from scrypt in Bytes
  dkLen = (version === 'v1') ? 32 : 64

  // A 32 Byte BLAKE2s hash of the password bytes
  scryptKey = blake.blake2s(decodeUTF8(password))

  getScryptKey(scryptKey, email, 17, 8, dkLen, 1000, function (scryptByteArray) {
    try {
      var keys = {}
      var seedBytesUint8Array, boxKeyPairSeed,
        signKeyPairSeed, boxKeyPair, signKeyPair

      // Convert scrypt Array of Bytes to Uint8Array
      seedBytesUint8Array = new Uint8Array(scryptByteArray)

      // Grab first 32 Bytes of scrypt seed for v1 and v2
      // The first 32 Bytes are the same for dkLen 32 and 64!
      boxKeyPairSeed = seedBytesUint8Array.subarray(0, 32)
      boxKeyPair = nacl.box.keyPair.fromSecretKey(boxKeyPairSeed)

      if (seedBytesUint8Array.length === 32) {
        keys.publicKey = boxKeyPair.publicKey
        keys.secretKey = boxKeyPair.secretKey
      } else {
        signKeyPairSeed = seedBytesUint8Array.subarray(32, 64)
        signKeyPair = nacl.sign.keyPair.fromSeed(signKeyPairSeed)

        keys.publicBoxKey = boxKeyPair.publicKey
        keys.publicBoxKeyBase64 = base64.fromByteArray(boxKeyPair.publicKey)
        keys.secretBoxKey = boxKeyPair.secretKey
        keys.secretBoxKeyBase64 = base64.fromByteArray(boxKeyPair.secretKey)
        keys.publicSignKey = signKeyPair.publicKey
        keys.publicSignKeyBase64 = base64.fromByteArray(signKeyPair.publicKey)
        keys.secretSignKey = signKeyPair.secretKey
        keys.secretSignKeyBase64 = base64.fromByteArray(signKeyPair.secretKey)
      }

      return callback(null, keys)
    } catch (err) {
      return callback(err)
    }
  })
}
