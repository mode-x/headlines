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
        <v-flex xs12 sm12 md6 v-for="(top_headline, index) in top_headlines" :key="index" v-else>
          <v-layout row wrap class="secondary mr-1 mb-1" style="height: inherit;">
            <v-flex xs12 sm6 style="margin: 0px;">
              <img :src=top_headline.urlToImage width="100%" v-if="top_headline.urlToImage" style="max-height: 180px;" onerror="this.src='./static/nkatar_logo.png'" alt="news_image"/>
              <img src='static/nkatar_logo.png' width="100%" v-else style="max-height: 180px;" alt="default_image"/>
            </v-flex>
            <v-flex xs12 sm6 class="px-3">
              <v-layout column>
                <v-flex xs6 class="card-title mt-1">
                  <div class="text-holder">
                    {{ top_headline.title }}
                  </div>
                </v-flex>
                <v-flex xs6 class="card-text">
                  {{ top_headline.source.name }}
                </v-flex>
                <v-flex xs6 class="card-text">
                  {{ formatedDate(top_headline.publishedAt) }}
                </v-flex>
                <v-flex xs6 class="action-text mt-1">
                  <v-layout row>
                    <v-flex xs6 class="action-text text-xs-center" style="cursor: pointer;" @click.stop="initializeFavorite(top_headline)" aria-label="home" role="button">
                      <v-icon color="red" size="24">favorite</v-icon>
                      Favorite
                    </v-flex>
                    <v-flex xs6 class="action-text text-xs-center">
                      <a :href=top_headline.url target="blank" :aria-label=index>
                        <v-icon color="blue" dark size="24">laptop_chromebook</v-icon>
                      </a>
                      Read
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
        <!-- <v-flex xs12 sm6 md3 v-for="(top_headline, index) in top_headlines" :key="index" v-else>
          <v-card dark color="secondary" style="height: 465px;">
            <v-card-media :src=top_headline.urlToImage height="180px" v-if="top_headline.urlToImage" style="min-height: 180px;" onerror="this.src='./static/flags/nigeria.gif'" alt="news_image">
            </v-card-media>
            <v-card-media src='static/nkatar_logo.png' height="180px" v-else style="min-height: 180px;" alt="default_image"></v-card-media>
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
        </v-flex> -->
      </v-layout>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="white--text" style="background-color: #607D8B;">
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
// import axios from 'axios'

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
      snackbar: false,
      web_worker: null
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
    this.closeStreaming()
    this.web_worker.terminate()
  },
  watch: {
    country (newValue, oldValue) {
      if (this.$store.getters.getFetchFromNetwork) {
        this.fetchFromNetwork()
      }
    },
    source (newValue, oldValue) {
      if (newValue.index) {
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
            }
          })
        })
      }
    },
    fetchByStreaming () {
      this.streamData = StreamDataIo.createEventSource(this.url, tokens.streamDataIoToken(), [])
      this.streamData.onData(data => {
        // initialize your data with the initial snapshot
        // console.log('Received data')
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
        // console.log('open')
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
      // Cache
      idb.indexDb().then((db) => {
        if (this.top_headlines.length > 0) return

        var index = db.transaction('nkatar-top-headlines')
          .objectStore('nkatar-top-headlines').index('by_date')

        index.getAll().then((articles) => {
          this.top_headlines = articles.reverse()
          this.loading = false
        })
        clearInterval(this.interval)
      })
      // Network
      this.fetchFromNetwork()
      // Streaming
      this.fetchByStreaming()
    },
    fetchFromNetwork () {
      if (window.Worker) {
        this.web_worker = new Worker('/static/worker.js')
        this.web_worker.postMessage([this.source.index, this.country.index, tokens.newsApiToken()])
        this.web_worker.onmessage = (event) => {
          this.top_headlines = event.data.articles
          caches.delete('nkatar-news-image').then(() => {
            // console.log('Image cache deleted')
          })
          idb.indexDb().then((db) => {
            const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
            const store = transaction.objectStore('nkatar-top-headlines')
            event.data.articles.forEach((article) => {
              const url = article.urlToImage
              // Put in IndexDB
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
        }
      }
    }
  },
  mounted () {
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0)
      }
      this.value += 10
    }, 1000)
    this.fetchCachedNews()
  }
}
</script>

<style scoped>
#card-holder {
  display: -webkit-flex; /* Safari */
  display: flex;
}

#card-actions {
  -webkit-align-self: flex-end; /* Safari 7.0+ */
  align-self: flex-end;
}

.card-title {
  font-size: 1em;
  text-align: left;
  align-items: flex-start;
}

.card-text {
  font-size: 0.85em;
  text-align: left;
  height: 20px;
}

.action-text {
  font-size: 0.85em;
  text-align: left;
  height: 40px;
}

.text-holder {
  font-size: 1em;
  text-align: left;
  align-items: flex-start;
  height: 95px;
  border-bottom: solid 1px white;
  opacity: 0.8;
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
