var test = require('tape')
var base64 = require('base64-js')

var session25519 = require('./index.js')
// var session25519 = require('./dist/session25519.js')

test('v1 explicit (legacy version)', function (t) {
  session25519('user@example.com', 'secret', function (err, key) {
    t.notOk(err, 'no error')

    t.deepEqual(key, {
      publicKey: base64.toByteArray('EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04='),
      secretKey: base64.toByteArray('p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw=')
    }, 'correct v1 key has been calculated')

    t.end()
  }, 'v1') // SPECIFIED v1 as last arg to retain legacy key output
})

test('v2 implicit', function (t) {
  session25519('user@example.com', 'secret', function (err, key) {
    t.notOk(err, 'no error')

    t.deepEqual(key, {
      publicBoxKey: base64.toByteArray('e5ecNjobMZJ564QyJVYBoqH0snU9brXFYH1v75RpMxs='),
      publicBoxKeyBase64: 'e5ecNjobMZJ564QyJVYBoqH0snU9brXFYH1v75RpMxs=',
      secretBoxKey: base64.toByteArray('w4mjtyfqrCvGqt3jLQFluCKloaZ4HyZ4QwrJRR50LIs='),
      secretBoxKeyBase64: 'w4mjtyfqrCvGqt3jLQFluCKloaZ4HyZ4QwrJRR50LIs=',
      publicSignKey: base64.toByteArray('Q9Ts3Uz6BcA3y4jVyaAjFaCE5HLyv9SHuDuklbQWmVQ='),
      publicSignKeyBase64: 'Q9Ts3Uz6BcA3y4jVyaAjFaCE5HLyv9SHuDuklbQWmVQ=',
      secretSignKey: base64.toByteArray('nXvLLFiIqECJ9pcRMdR6zX4X1Lw2o5taZPxFkLxDt+VD1OzdTPoFwDfLiNXJoCMVoITkcvK/1Ie4O6SVtBaZVA=='),
      secretSignKeyBase64: 'nXvLLFiIqECJ9pcRMdR6zX4X1Lw2o5taZPxFkLxDt+VD1OzdTPoFwDfLiNXJoCMVoITkcvK/1Ie4O6SVtBaZVA=='
    }, 'correct v2 key has been calculated')

    t.end()
  }) // No version arg
})

test('v2 explicit', function (t) {
  session25519('user@example.com', 'secret', function (err, key) {
    t.notOk(err, 'no error')

    t.deepEqual(key, {
      publicBoxKey: base64.toByteArray('e5ecNjobMZJ564QyJVYBoqH0snU9brXFYH1v75RpMxs='),
      publicBoxKeyBase64: 'e5ecNjobMZJ564QyJVYBoqH0snU9brXFYH1v75RpMxs=',
      secretBoxKey: base64.toByteArray('w4mjtyfqrCvGqt3jLQFluCKloaZ4HyZ4QwrJRR50LIs='),
      secretBoxKeyBase64: 'w4mjtyfqrCvGqt3jLQFluCKloaZ4HyZ4QwrJRR50LIs=',
      publicSignKey: base64.toByteArray('Q9Ts3Uz6BcA3y4jVyaAjFaCE5HLyv9SHuDuklbQWmVQ='),
      publicSignKeyBase64: 'Q9Ts3Uz6BcA3y4jVyaAjFaCE5HLyv9SHuDuklbQWmVQ=',
      secretSignKey: base64.toByteArray('nXvLLFiIqECJ9pcRMdR6zX4X1Lw2o5taZPxFkLxDt+VD1OzdTPoFwDfLiNXJoCMVoITkcvK/1Ie4O6SVtBaZVA=='),
      secretSignKeyBase64: 'nXvLLFiIqECJ9pcRMdR6zX4X1Lw2o5taZPxFkLxDt+VD1OzdTPoFwDfLiNXJoCMVoITkcvK/1Ie4O6SVtBaZVA=='
    }, 'correct v2 key has been calculated')

    t.end()
  }, 'v2') // SPECIFIED v2 as version
})
