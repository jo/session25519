var blake = require('blakejs')
var scrypt = require('scrypt-async')
var nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')

// Code inspired by:
// https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js

// Input: User key hash (Uint8Array), Salt (Uint8Array), callback function
// Result: Calls scrypt which returns 32 bytes of key material in an Array,
// which is then passed to the callback.
function getScryptKey (key, salt, callback) {
  scrypt(key, salt, 17, 8, 32, 1000, function (keyBytes) {
    return callback(keyBytes)
  }, null)
}

module.exports = function session (email, password, callback) {
  var keyHash = blake.blake2s_init(nacl.box.secretKeyLength)
  blake.blake2s_update(keyHash, nacl.util.decodeUTF8(password))

  getScryptKey(blake.blake2s_final(keyHash), nacl.util.decodeUTF8(email), function (keyBytes) {
    try {
      var keyBytesUint8 = new Uint8Array(keyBytes)

      // Generate a keyPair for encryption from the scrypt bytes
      var keyPair = nacl.box.keyPair.fromSecretKey(keyBytesUint8)

      // Hash the derived keyBytes for use as the 32 Byte seed for
      // an additional keypair used for signing. This signing
      // key pair will also be deterministically generated.
      var signingKeyHash = blake.blake2s_init(nacl.sign.seedLength)
      blake.blake2s_update(signingKeyHash, keyBytesUint8)
      var signingKeyPair = nacl.sign.keyPair.fromSeed(blake.blake2s_final(signingKeyHash))

      // merge the signing keys into the keyPair
      keyPair.publicSigningKey = signingKeyPair.publicKey
      keyPair.secretSigningKey = signingKeyPair.secretKey

      return callback(null, keyPair)
    } catch (err) {
      return callback(err)
    }
  })
}
