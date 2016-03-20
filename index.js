var BLAKE2s = require('blake2s-js')
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
//   dkLen             = 64   // Length of derived key in Bytes
//   interruptStep     = 1000 // Steps to split calculation with timeouts
//   callback function
//
// Result:
//   Returns 64 bytes of scrypt derived key material in an Array,
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
//
// Result:
//   An object literal with keys
//
module.exports = function session (email, password, callback) {
  'use strict'

  // A 32 Byte BLAKE2s hash of the password bytes
  var keyHash = new BLAKE2s()
  keyHash.update(decodeUTF8(password))
  var scryptKey = keyHash.digest()

  getScryptKey(scryptKey, email, 17, 8, 64, 1000, function (scryptByteArray) {
    try {
      var keys, seedBytesUint8Array, boxKeyPairSeed,
        signKeyPairSeed, signKeyPair

      // Convert scrypt Array of Bytes to Uint8Array
      seedBytesUint8Array = new Uint8Array(scryptByteArray)

      // First 32 Bytes of scrypt seed for encryption keys
      // Note : first 32 Bytes are the same for dkLen 32 (old way) and 64!
      boxKeyPairSeed = seedBytesUint8Array.subarray(0, 32)
      keys = nacl.box.keyPair.fromSecretKey(boxKeyPairSeed)
      keys.publicKeyBase64 = base64.fromByteArray(keys.publicKey)
      keys.secretKeyBase64 = base64.fromByteArray(keys.secretKey)

      // Last 32 Bytes of scrypt seed for signing keys
      signKeyPairSeed = seedBytesUint8Array.subarray(32, 64)
      signKeyPair = nacl.sign.keyPair.fromSeed(signKeyPairSeed)
      keys.publicSignKey = signKeyPair.publicKey
      keys.publicSignKeyBase64 = base64.fromByteArray(signKeyPair.publicKey)
      keys.secretSignKey = signKeyPair.secretKey
      keys.secretSignKeyBase64 = base64.fromByteArray(signKeyPair.secretKey)

      return callback(null, keys)
    } catch (err) {
      return callback(err)
    }
  })
}
