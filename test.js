var test = require('tape')
var nacl = require('tweetnacl')

var session25519 = require('./')

test('basic', function(t) {
  session25519('user@example.com', 'secret', function(err, key) {
    t.notOk(err, 'no error')
    
    t.deepEqual(key, {
      publicKey: nacl.util.decodeBase64('EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04='),
      secretKey: nacl.util.decodeBase64('p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw=')
    }, 'correct key has been calculated')
    
    t.end()
  })
})
