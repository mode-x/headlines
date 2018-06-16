import workbox from 'workbox' // fake

workbox.skipWaiting()

workbox.core.setCacheNameDetails({
  prefix: 'headline',
  suffix: 'v1',
  precache: 'pre',
  runtime: 'run',
  googleAnalytics: 'ga'
})

const precacheController = new workbox.precaching.PrecacheController()

precacheController.addToCacheList(self.__precacheManifest)

precacheController.addToCacheList([
  {
    url: '/'
  }
])

self.addEventListener('install', (event) => {
  event.waitUntil(precacheController.install())
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          console.log(cacheName)
          return cacheName.startsWith('headline') && cacheName !== workbox.core.cacheNames.precache + '-temp'
        }).map(function (cacheName) {
          return caches.delete(cacheName)
        })
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log(response)
        return response
      } else {
        fetch(event.request)
          .then((response) => {
            if (response.status === 403) {
              console.log('Forbidden')
              return '/static/img/nkatar_logo.png'
            } else if (response.status === 404) {
              console.log('Not Found')
              return '/static/img/nkatar_logo.png'
            }
            return response
          })
          .catch((error) => {
            console.log(error)
          })
      }
    })
  )
})
