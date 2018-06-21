<template>
  <v-app id="home">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12 sm12 md12 v-if="loading">
          <v-progress-circular
            :size="100"
            :width="15"
            :rotate="-90"
            :value="value"
            color="primary"
          >
            {{ value }}
          </v-progress-circular>
        </v-flex>
        <v-flex xs12 sm6 md3  v-for="(top_headline, index) in top_headlines" :key="index" v-else>
          <v-card dark color="secondary" style="height: 465px;">
            <v-card-media :src=top_headline.urlToImage height="180px" v-if="top_headline.urlToImage" style="min-height: 180px;" onerror="this.src='./static/flags/nigeria.gif'">
            </v-card-media>
            <v-card-media src='static/nkatar_logo.png' height="180px" v-else style="min-height: 180px;"></v-card-media>
            <v-card-title primary-title class="card-title">
              {{ top_headline.title }}
            </v-card-title>
            <v-card-text class="card-text">
              {{ top_headline.source.name }} - {{ formatedDate(top_headline.publishedAt) }}
            </v-card-text>
            <v-card-actions class="d-flex align-items-end">
              <v-btn flat color="orange" @click.stop="initializeFavorite(top_headline)">
                <v-icon color="red" class="mr-2">favorite</v-icon>
                Favorite
              </v-btn>
              <v-btn flat color="orange" :href=top_headline.url target="blank">
                <v-icon color="white" class="mr-2">laptop_chromebook</v-icon>
                Read
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title style="background-color: #2196F3;">
            Add Favorite
          </v-card-title>
          <v-card-text>
            Add to favorites?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue" flat @click.stop="dialog=false">Cancel</v-btn>
            <v-btn color="orange" flat @click.stop="saveFavorite()">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar
        :timeout=6000
        :top=true
        :right=true
        v-model="snackbar">
        Successfully added
        <v-btn flat color="orange" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>
    </v-container>
  </v-app>
</template>

<script>
import { StreamDataIo } from 'streamdataio-js-sdk'
import * as jsonpatch from 'fast-json-patch'

const moment = require('moment')
const idb = require('../assets/js/idb.js')
const tokens = require('../assets/js/tokens.js')

export default {
  name: 'home',
  data () {
    return {
      title: 'Top Headlines',
      model: 'tab-1',
      url: 'http://newsapi.org/v2/top-headlines',
      top_headlines: [],
      streamData: null,
      isConnected: false,
      loading: true,
      interval: {},
      value: 10,
      favorite_article: null,
      dialog: false,
      snackbar: false
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
    this.closeStreaming()
  },
  watch: {
    country (newValue, oldValue) {
      if (this.$store.getters.getfetchFromNetwork) {
        this.fetchFromNetwork()
      }
    },
    source (newValue, oldValue) {
      if (this.$store.getters.getfetchFromNetwork) {
        this.fetchFromNetwork()
      }
    }
  },
  computed: {
    country () {
      return this.$store.getters.getCountry
    },
    source () {
      return this.$store.getters.getSource
    }
  },
  methods: {
    initializeFavorite (article) {
      this.dialog = true
      this.favorite_article = article
    },
    saveFavorite () {
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-favorites', 'readwrite')
        const store = transaction.objectStore('nkatar-favorites')
        const url = this.favorite_article.urlToImage
        store.put(this.favorite_article)
        // Put in Cache
        fetch(url, {mode: 'no-cors'})
          .then((response) => {
            caches.open('nkatar-favorite-news-image').then((cache) => {
              cache.put(url, response)
            })
          })
          .catch((error) => {
            console.log(error)
          })
        idb.indexDb().then((db) => {
          const transaction = db.transaction('nkatar-favorites', 'readwrite')
          const store = transaction.objectStore('nkatar-favorites')
          return store.getAll()
        }).then((fav) => {
          this.$store.commit('setFavorites', fav)
        })
        this.dialog = false
        this.snackbar = true
      })
    },
    formatedDate (value) {
      return moment(value).calendar()
    },
    deleteNews (data) {
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
        const store = transaction.objectStore('nkatar-top-headlines')
        data.articles.forEach((article) => {
          const url = article.urlToImage
          store.put(article)
          // Put in Cache
          fetch(url, {mode: 'no-cors'})
            .then((response) => {
              caches.open('nkatar-news-image').then((cache) => {
                cache.put(url, response)
              })
            })
            .catch((error) => {
              console.log(error)
            })
        })
        // limit store to 20 items
        store.index('by_date').openCursor(null, 'prev').then(function (cursor) {
          return cursor.advance(20)
        }).then(function deleteRest (cursor) {
          if (!cursor) return
          cursor.delete()
          return cursor.continue().then(deleteRest)
        })
      })
    },
    sendPushNotification (message) {
      const url = this.$store.getters.getEndPointUrl
      fetch(url, {
        mode: 'no-cors',
        method: 'POST',
        body: message,
        headers: {
          'TTL': '60',
          'Content-Length': '0',
          'Authorization': 'key=AAAA67jKjYQ:APA91bG0xZL0Z23b6YZyyhEPvhVuaJhwOrKQgq85ppL7nlo3gqHfKph1S_tIz5YPudtel-yxIdZYM32vM76W0EGVttrWnOHOVLJFAe9FsvhX1p-mOrZUtu8XakYzPkllJMFz_1K0tKtz'
        }
      }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response))
    },
    pushNotification (message) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('Nkatar', {
            body: message,
            icon: '/static/nkatar_logo.png',
            tag: 'id1',
            renotify: true,
            vibrate: [100, 50, 100],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 1
            },
            actions: [
              {action: 'open', title: 'Read'}
            ]
          })
        })
      }
    },
    fetchByStreaming () {
      this.streamData = StreamDataIo.createEventSource(this.url, tokens.streamDataIoToken(), [])
      this.streamData.onData(data => {
        // initialize your data with the initial snapshot
        console.log('Received data')
        // console.log(data)
      }, this).onPatch(patch => {
        // update the data with the provided patch// update the data with the provided patch
        // console.log('received patch %o', patch)
        this.top_headlines = {articles: this.top_headlines}
        jsonpatch.applyPatch(this.top_headlines, patch)
        this.deleteNews(this.top_headlines)
        this.top_headlines = this.top_headlines.articles
        // console.log(this.top_headlines)
        this.pushNotification('New headlines')
      }, this).onError(error => {
        // do whatever you need in case of error
        console.log('error: %o', error)
        this.streamData.close()
        this.isConnected = false
        this.fetchCachedNews()
      }, this).onOpen(function () {
        this.isConnected = true
        // you can also add custom behavior when the stream is opened
        console.log('open')
      }, this)
      this.streamData.open()
    },
    closeStreaming () {
      if (this.streamData) {
        this.streamData.close()
      }
      this.isConnected = false
    },
    fetchCachedNews () {
      idb.indexDb().then((db) => {
        if (this.top_headlines.length > 0) return

        var index = db.transaction('nkatar-top-headlines')
          .objectStore('nkatar-top-headlines').index('by_date')

        index.getAll().then((articles) => {
          this.top_headlines = articles.reverse()
          this.loading = false
        })
      })
    },
    fetchFromNetwork () {
      if (navigator.onLine) {
        let newsUrl
        const token = tokens.newsApiToken()
        if (this.source.index) {
          newsUrl = `https://newsapi.org/v2/top-headlines?sources=${this.source.index}&apiKey=${token}`
        } else {
          newsUrl = `https://newsapi.org/v2/top-headlines?country=${this.country.index}&apiKey=${token}`
        }
        fetch(newsUrl)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            this.top_headlines = data.articles
            // console.log(data)
            caches.delete('nkatar-news-image').then(() => {
              // console.log('Image cache deleted')
            })
            idb.indexDb().then((db) => {
              const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
              const store = transaction.objectStore('nkatar-top-headlines')
              data.articles.forEach((article) => {
                // let newUrl
                const url = article.urlToImage
                // if (url && url.substring(0, 5) === 'http:') {
                //   newUrl = url.replace('http:', 'https:')
                // } else {
                //   newUrl = url
                // }
                // article.urlToImage = newUrl
                // Put in IndexDB
                store.put(article)
                // Put in Cache
                fetch(url, {mode: 'no-cors'})
                  .then((response) => {
                    // if (!response.ok) {
                    //   throw Error("Can't fetch image")
                    // }
                    caches.open('nkatar-news-image').then((cache) => {
                      cache.put(url, response)
                    })
                  })
                  .catch((error) => {
                    console.log(error)
                  })
              })
              // limit store to 20 items
              store.index('by_date').openCursor(null, 'prev').then(function (cursor) {
                return cursor.advance(20)
              }).then(function deleteRest (cursor) {
                if (!cursor) return
                cursor.delete()
                return cursor.continue().then(deleteRest)
              })
              // Streaming
              this.fetchByStreaming()
            })
              .then(() => {
                this.loading = false
                clearInterval(this.interval)
              })
          })
      } else {
        this.fetchCachedNews()
        clearInterval(this.interval)
      }
    }
  },
  mounted () {
    // this.sendPushNotification('Post message')
    this.fetchFromNetwork()
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0)
      }
      this.value += 10
    }, 1000)
  }
}
</script>

<style>
#card-holder {
  display: -webkit-flex; /* Safari */
  display: flex;
}

#card-actions {
  -webkit-align-self: flex-end; /* Safari 7.0+ */
  align-self: flex-end;
}

.card-title {
  font-size: 1.4em;
  text-align: left;
  height: 180px;
}

.card-text {
  font-size: 0.9em;
  text-align: left;
}

.truncate {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #35495E;
}
</style>
