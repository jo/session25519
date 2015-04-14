var BLAKE2s = require('blake2s-js')
var scrypt = require('scrypt-async')
var nacl = require('tweetnacl')

// Code from https://github.com/kaepora/miniLock
// src/js/miniLock.js

// Input: User key hash (Uint8Array), Salt (Uint8Array), callback function
// Result: Calls scrypt which returns
//	32 bytes of key material in a Uint8Array,
//	which then passed to the callback.
function getScryptKey(key, salt, callback) {
	scrypt(key, salt, 17, 8, 32, 1000, function(keyBytes) {
		return callback(nacl.util.decodeBase64(keyBytes))
	}, 'base64');
}

module.exports = function session(email, password, callback) {
  var keyHash = new BLAKE2s(nacl.box.secretKeyLength)

  keyHash.update(nacl.util.decodeUTF8(password))

  var key = keyHash.digest()
  var salt = nacl.util.decodeUTF8(email)

  getScryptKey(key, salt, function(keyBytes) {
    try {
      var keyPair = nacl.box.keyPair.fromSecretKey(keyBytes)
      callback(null, keyPair)
    } catch(err) {
      callback(err)
    }
  })
}
