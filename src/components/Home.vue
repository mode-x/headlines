<template>
  <v-app id="home">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12 sm6 md3  v-for="(top_headline, index) in top_headlines" :key="index">
          <v-card dark color="secondary" style="height: 450px; padding-bottom: 15px;">
            <v-card-media :src=top_headline.urlToImage height="180px" v-if="top_headline.urlToImage" style="min-height: 180px;"></v-card-media>
            <v-card-media src='https://firebasestorage.googleapis.com/v0/b/nkatar-c8bcd.appspot.com/o/nkatar_logo.png?alt=media&token=34ba0584-0662-48c6-866f-3e0665be06ba' height="180px" v-else style="min-height: 180px;"></v-card-media>
            <v-card-title primary-title class="card-title">
              {{ top_headline.title }}
            </v-card-title>
            <v-card-text class="card-text truncate">
              <!-- {{ top_headline.description }} -->
            </v-card-text>
            <v-card-actions class="d-flex align-items-end">
              <v-btn flat color="orange">Share</v-btn>
              <v-btn flat color="orange" :href=top_headline.url>Read </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import { StreamDataIo } from 'streamdataio-js-sdk'
import * as jsonpatch from 'fast-json-patch'

const idb = require('../assets/js/idb.js')
// const worker = new Worker('~/src/assets/js/worker.js')

export default {
  name: 'home',
  data () {
    return {
      title: 'Top Headlines',
      model: 'tab-1',
      url: 'http://newsapi.org/v2/top-headlinesx',
      token: 'YzFmODhlOGYtMzAyZi00YjNiLWE5NjctNmUyZjg0YTlkMzYz',
      top_headlines: [],
      streamData: null,
      isConnected: false,
      country: 'ng'
    }
  },
  watch: {
    countrySelected (newValue, oldValue) {
      this.country = newValue.index
      this.fetchFromNetwork()
    }
  },
  computed: {
    countrySelected () {
      return this.$store.getters.getCountry
    }
  },
  methods: {
    deleteNews (data) {
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
        const store = transaction.objectStore('nkatar-top-headlines')
        data.articles.forEach((article) => {
          store.put(article)
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
    fetchByStreaming () {
      this.streamData = StreamDataIo.createEventSource(this.url, this.token, [])
      this.streamData.onData(data => {
        // initialize your data with the initial snapshot
        console.log('Received data')
        console.log(data)
        this.top_headlines = data
        console.log(this.top_headlines)
        this.deleteNews(data)
      }, this).onPatch(patch => {
        // update the data with the provided patch// update the data with the provided patch
        console.log('received patch %o', patch)
        jsonpatch.applyPatch(this.top_headlines, patch)
        console.log(this.top_headlines)
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
          this.top_headlines = {articles: articles.reverse()}
        })
      })
      // this.fetchFromNetwork()
    },
    fetchFromNetwork () {
      fetch(`https://newsapi.org/v2/top-headlines?country=${this.country}&apiKey=8f9773109c594f5cad47ace0c1970333`)
        .then((response) => {
          if (!response) {
            console.log(response)
            this.fetchCachedNews()
            return
          }
          return response.json()
        })
        .then((data) => {
          this.top_headlines = data.articles
          // console.log(data)
          idb.indexDb().then((db) => {
            const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
            const store = transaction.objectStore('nkatar-top-headlines')
            data.articles.forEach((article) => {
              // Put in IndexDB
              store.put(article)
              // Put in Cache
              
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
        })
    }
  },
  mounted () {
    this.fetchFromNetwork()
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
