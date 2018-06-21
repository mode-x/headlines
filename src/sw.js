import workbox from 'fake_workbox' // fake

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

precacheController.addToCacheList([
  {
    url: '/static/flags/argentina.gif'
  },
  {
    url: '/static/flags/australia.gif'
  },
  {
    url: '/static/flags/austria.gif'
  },
  {
    url: '/static/flags/belgium.gif'
  },
  {
    url: '/static/flags/brazil.gif'
  },
  {
    url: '/static/flags/bulgaria.gif'
  },
  {
    url: '/static/flags/canada.gif'
  },
  {
    url: '/static/flags/china.gif'
  },
  {
    url: '/static/flags/colombia.gif'
  },
  {
    url: '/static/flags/cuba.gif'
  },
  {
    url: '/static/flags/czech_republic.gif'
  },
  {
    url: '/static/flags/egypt.gif'
  },
  {
    url: '/static/flags/france.gif'
  },
  {
    url: '/static/flags/germany.gif'
  },
  {
    url: '/static/flags/greece.gif'
  },
  {
    url: '/static/flags/hong_kong.gif'
  },
  {
    url: '/static/flags/hungary.gif'
  },
  {
    url: '/static/flags/india.gif'
  },
  {
    url: '/static/flags/Iindonesia.gif'
  },
  {
    url: '/static/flags/ireland.gif'
  },
  {
    url: '/static/flags/israel.gif'
  },
  {
    url: '/static/flags/italy.gif'
  },
  {
    url: '/static/flags/japan.gif'
  },
  {
    url: '/static/flags/latvia.gif'
  },
  {
    url: '/static/flags/lithuania.gif'
  },
  {
    url: '/static/flags/malaysia.gif'
  },
  {
    url: '/static/flags/mexico.gif'
  },
  {
    url: '/static/flags/morocco.gif'
  },
  {
    url: '/static/flags/netherlands.gif'
  },
  {
    url: '/static/flags/new_zealand.gif'
  },
  {
    url: '/static/flags/nigeria.gif'
  },
  {
    url: '/static/flags/norway.gif'
  },
  {
    url: '/static/flags/philippines.gif'
  },
  {
    url: '/static/flags/poland.gif'
  },
  {
    url: '/static/flags/portugal.gif'
  },
  {
    url: '/static/flags/romania.gif'
  },
  {
    url: '/static/flags/russia.gif'
  },
  {
    url: '/static/flags/saudi_arabia.gif'
  },
  {
    url: '/static/flags/serbia.gif'
  },
  {
    url: '/static/flags/singapore.gif'
  },
  {
    url: '/static/flags/slovakia.gif'
  },
  {
    url: '/static/flags/slovenia.gif'
  },
  {
    url: '/static/flags/south_africa.gif'
  },
  {
    url: '/static/flags/south_korea.gif'
  },
  {
    url: '/static/flags/sweden.gif'
  },
  {
    url: '/static/flags/switzerland.gif'
  },
  {
    url: '/static/flags/taiwan.gif'
  },
  {
    url: '/static/flags/thailand.gif'
  },
  {
    url: '/static/flags/turkey.gif'
  },
  {
    url: '/static/flags/ukraine.gif'
  },
  {
    url: '/static/flags/united_arab_emirates.gif'
  },
  {
    url: '/static/flags/united_kingdom.gif'
  },
  {
    url: '/static/flags/united_states_of_america.gif'
  },
  {
    url: '/static/flags/venezuela.gif'
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
      return response || fetch(event.request)
        .then((response) => {
          if (response === undefined) {
          } else if (response.status === 403) {
            return fetch('/static/nkatar_logo.png')
          } else if (response.status === 404) {
            return fetch('/static/nkatar_logo.png')
          }
          return response
        })
        .catch((error) => {
          console.log(error)
        })
    })
  )
})

self.addEventListener('push', (event) => {
  const title = 'Get Started With Workbox'
  const options = {
    body: event.data.text()
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
