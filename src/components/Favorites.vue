<template>
  <v-app id="favorites">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12 sm12 md6  v-for="(favorite, index) in favorites" :key="index">
          <v-layout row wrap class="secondary mr-1 mb-1" style="height: inherit;">
            <v-flex xs12 sm6 style="margin: 0px;">
              <img :src=favorite.urlToImage width="100%" v-if="favorite.urlToImage" style="max-height: 180px;" onerror="this.src='./static/nkatar_logo.png'" alt="news_image"/>
              <img src='static/nkatar_logo.png' width="100%" v-else style="max-height: 180px;" alt="default_image"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-layout column>
                <v-flex xs6 class="card-title">
                  <div class="text-holder">
                    {{ favorite.title }}
                  </div>
                </v-flex>
                <v-flex xs6 class="card-text">
                  {{ favorite.source.name }}
                </v-flex>
                <v-flex xs6 class="card-text">
                  {{ formatedDate(favorite.publishedAt) }}
                </v-flex>
                <v-flex xs6 class="action-text mt-1">
                  <v-layout row>
                    <v-flex xs6 class="action-text text-xs-center" style="cursor: pointer;" @click.stop="initializeFavorite(favorite)">
                      <v-icon color="red" size="24">delete</v-icon>
                      Delete
                    </v-flex>
                    <v-flex xs6 class="action-text text-xs-center">
                      <a :href=favorite.url target="blank">
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
        <!-- <v-flex xs12 sm6 md3  v-for="(favorite, index) in favorites" :key="index">
          <v-card dark color="secondary" style="height: 465px;">
            <v-card-media :src=favorite.urlToImage height="180px" v-if="favorite.urlToImage" style="min-height: 180px;" onerror="this.src='./static/flags/nigeria.gif'">
            </v-card-media>
            <v-card-media src='static/nkatar_logo.png' height="180px" v-else style="min-height: 180px;"></v-card-media>
            <v-card-title primary-title class="card-title">
              {{ favorite.title }}
            </v-card-title>
            <v-card-text class="card-text">
              {{ favorite.source.name }} - {{ formatedDate(favorite.publishedAt) }}
            </v-card-text>
            <v-card-actions class="d-flex align-items-end">
              <v-btn flat color="orange" @click.stop="initializeFavorite(favorite)">
                <v-icon color="red" class="mr-2">delete</v-icon>
                Delete
              </v-btn>
              <v-btn flat color="orange" :href=favorite.url target="blank">
                <v-icon color="white" class="mr-2">laptop_chromebook</v-icon>
                Read
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex> -->
      </v-layout>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="white--text" style="background-color: #2196F3;">
            Delete Favorite
          </v-card-title>
          <v-card-text>
            Delete from favorites?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue" flat @click.stop="dialog=false">Delete</v-btn>
            <v-btn color="orange" flat @click.stop="deleteFavorite()">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar
        :timeout=6000
        :top=true
        :right=true
        v-model="snackbar">
        Successfully deleted
        <v-btn flat color="orange" @click.native="snackbar = false">Close</v-btn>
      </v-snackbar>
    </v-container>
  </v-app>
</template>

<script>
const moment = require('moment')
const idb = require('../assets/js/idb.js')

export default {
  name: 'favorites',
  data () {
    return {
      title: 'Favorites',
      favorites: [],
      favorite_article: null,
      dialog: false,
      snackbar: false
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.by_countries) {
        // vm.$router.replace('/')
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    next()
    alert('beforeRouteUpdate')
  },
  beforeRouteLeave (to, from, next) {
    next()
  },
  methods: {
    initializeFavorite (article) {
      this.dialog = true
      this.favorite_article = article
    },
    deleteFavorite () {
      let deleteRest
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-favorites', 'readwrite')
        const store = transaction.objectStore('nkatar-favorites')

        store.index('by_date').openCursor(null, 'prev').then((cursor) => {
          return cursor
        }).then(deleteRest = (cursor) => {
          if (!cursor) return
          if (cursor.value.title === this.favorite_article.title) {
            const url = this.favorite_article.urlToImage
            cursor.delete()
            caches.open('nkatar-favorite-news-image').then((cache) => {
              cache.delete(url)
            })
          }
          return cursor.continue().then(deleteRest)
        })
      })
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-favorites', 'readwrite')
        const store = transaction.objectStore('nkatar-favorites')
        return store.getAll()
      }).then((fav) => {
        this.$store.commit('setFavorites', fav)
        console.log(fav)
        this.favorites = fav
        this.dialog = false
        this.snackbar = true
      })
    },
    formatedDate (value) {
      return moment(value).calendar()
    },
    fetchCachedNews () {
      this.$store.commit('setShowFavorites', true)
      idb.indexDb().then((db) => {
        if (this.favorites.length > 0) return

        var index = db.transaction('nkatar-favorites')
          .objectStore('nkatar-favorites').index('by_date')

        index.getAll().then((articles) => {
          this.favorites = articles.reverse()
        })
      })
    }
  },
  mounted () {
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
  color: black;
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
  color: black;
  height: 100px;
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
