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
      publicBoxKey: base64.toByteArray('EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04='),
      publicBoxKeyBase64: 'EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04=',
      secretBoxKey: base64.toByteArray('p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw='),
      secretBoxKeyBase64: 'p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw=',
      publicSignKey: base64.toByteArray('Fp5BVsrHfXRylmxaeIzPI8IUbJ+TzpX8sqFRAeFAAR0='),
      publicSignKeyBase64: 'Fp5BVsrHfXRylmxaeIzPI8IUbJ+TzpX8sqFRAeFAAR0=',
      secretSignKey: base64.toByteArray('8RBvdhPctH1OW49fCVOT9du8cIjf0T664FXEdml+ShAWnkFWysd9dHKWbFp4jM8jwhRsn5POlfyyoVEB4UABHQ=='),
      secretSignKeyBase64: '8RBvdhPctH1OW49fCVOT9du8cIjf0T664FXEdml+ShAWnkFWysd9dHKWbFp4jM8jwhRsn5POlfyyoVEB4UABHQ=='
    }, 'correct v2 key has been calculated')

    t.end()
  }) // No version arg
})

test('v2 explicit', function (t) {
  session25519('user@example.com', 'secret', function (err, key) {
    t.notOk(err, 'no error')

    t.deepEqual(key, {
      publicBoxKey: base64.toByteArray('EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04='),
      publicBoxKeyBase64: 'EHfJ2sJJt7LjamnuJul6TlCb5SkgAwJI1PP7q95jh04=',
      secretBoxKey: base64.toByteArray('p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw='),
      secretBoxKeyBase64: 'p6FU22u0423AcS0AKY6I+XeBTMDzQLX57XOH9Xg28pw=',
      publicSignKey: base64.toByteArray('Fp5BVsrHfXRylmxaeIzPI8IUbJ+TzpX8sqFRAeFAAR0='),
      publicSignKeyBase64: 'Fp5BVsrHfXRylmxaeIzPI8IUbJ+TzpX8sqFRAeFAAR0=',
      secretSignKey: base64.toByteArray('8RBvdhPctH1OW49fCVOT9du8cIjf0T664FXEdml+ShAWnkFWysd9dHKWbFp4jM8jwhRsn5POlfyyoVEB4UABHQ=='),
      secretSignKeyBase64: '8RBvdhPctH1OW49fCVOT9du8cIjf0T664FXEdml+ShAWnkFWysd9dHKWbFp4jM8jwhRsn5POlfyyoVEB4UABHQ=='
    }, 'correct v2 key has been calculated')

    t.end()
  }, 'v2') // SPECIFIED v2 as version
})
