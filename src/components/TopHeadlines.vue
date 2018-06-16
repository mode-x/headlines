<template>
  <div id="home">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex right xs6>
            {{ countrySelected.name }}
          </v-flex>
          <v-flex right xs6>
            <!-- <img :src="country_flag_image_src" width="50"/> -->
          </v-flex>
          <v-flex xs12 sm6 md3  v-for="(top_headline, index) in top_headlines.articles" :key="index">
            <v-card dark color="secondary" style="height: 450px; padding-bottom: 15px;">
              <v-card-media :src=top_headline.urlToImage height="180px" v-if="top_headline.urlToImage" style="min-height: 180px;"></v-card-media>
              <v-card-media src='./static/img/nkatar_logo.png' height="180px" v-else style="min-height: 180px;"></v-card-media>
              <v-card-title primary-title class="card-title">
                {{ top_headline.title }}
              </v-card-title>
              <v-card-text class="card-text truncate">
                <!-- {{ top_headline.description }} -->
              </v-card-text>
              <v-card-actions class="d-flex align-items-end">
                <v-btn flat color="orange">Share</v-btn>
                <v-btn flat color="orange" :href=top_headline.url>Read</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
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
      country: 'ng',
      country_flag_image_src: null
    }
  },
  watch: {
    countrySelected (newValue, oldValue) {
      this.country = newValue.index
      // const name = newValue.name.replace(/ /g, '-').toLowerCase()
      // this.country_flag_image_src = `https://firebasestorage.googleapis.com/v0/b/nkatar-c8bcd.appspot.com/o/countries%2F${name}.gif?alt=media&token=7cf45428-d83c-4f5b-8fad-606d276ac8ea`
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
    // open a connection to the server for live updates
    fetchFromNetwork () {
      fetch(`https://newsapi.org/v2/top-headlines?country=${this.country}&apiKey=8f9773109c594f5cad47ace0c1970333`)
        .then((response) => {
          console.log(response)
          if (!response) {
            this.fetchCachedNews()
            return
          }
          return response.json()
        })
        .then((data) => {
          this.top_headlines = data.articles
          console.log(data)
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
        })
    }
  },
  mounted () {
    // this.fetchByStreaming()
  }
}
</script>

<style>
#home {
  margin-top: 120px;
}

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
