<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" temporary app>
      <template>
        <v-container fluid>
          <v-layout row wrap>
            <v-flex xs12 mt-5>
              <span>Countries</span>
              <v-select
                :items="countries"
                v-model="country"
                label="Select a country"
                single-line
                auto
                hide-details
                @change="drawer = !drawer"
              ></v-select>
            </v-flex>
            <v-flex xs12 my-5>
              <span >Sources</span>
              <v-select
                :items="sources"
                v-model="source"
                label="Select a source"
                single-line
                auto
                hide-details
                @change="drawer = !drawer"
              ></v-select>
            </v-flex>
            <v-flex xs12>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-btn block color="primary" dark @click.stop="openFavorites()" aria-label="open_favotites">
                    {{ fetchFavorites.length }} Favorite(s)
                    <v-icon color="red" right>favorite</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn block color="primary" dark @click.stop="dialog=true" aria-label="enable_push">
                    <span v-if="push_enabled">Push Notifications Enabled</span>
                    <span v-else>Enable Push Notifications</span>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
    <v-toolbar color="primary" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" aria-label="menu"></v-toolbar-side-icon>
      <v-toolbar-title style="margin-left: 3px;">Nkatar</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="by_countries && !showFavorites">
        <span class="pr-2">{{ `Country: ${displayCountry(selectedCountry)}` }}</span>
        <img :src=country_flag width="25" alt="flag"/>
      </template>
      <template v-if="by_sources">
        <span class="pr-2">{{ `Source: ${displaySource(selectedSource)}` }}</span>
      </template>
      <v-btn icon v-if="showFavorites" @click.stop="home()" aria-label="home">
        <v-icon>home</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout column>
          <v-flex>
            <v-alert v-model="alert" type="success" dismissible>
              {{ alert_message }}
            </v-alert>
          </v-flex>
          <v-flex>
            <router-view></router-view>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="primary" app>
      <span class="white--text pl-3">&copy; 2018</span>
    </v-footer>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="white--text" style="background-color: #607D8B;">
          Push Notification
        </v-card-title>
        <v-card-text>
          Would you like to be subscribed for Push Notifications?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue" flat @click.stop="dialog=false" aria-label="cancel_push">Cancel</v-btn>
          <v-btn color="orange" flat @click.stop="subscribeUser()" aria-label="ok_push">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog1" max-width="500px">
      <v-card>
        <v-card-title class="white--text" style="background-color: #607D8B;">
          <span class="text-white">Favorites</span>
        </v-card-title>
        <v-card-text>
          You have not added any item to this collection.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue" flat @click.stop="dialog1=false" aria-label="cancel_favorite">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
const apiCountries = require('./assets/js/api_countries.js')
const apiSources = require('./assets/js/api_sources.js')

const idb = require('./assets/js/idb.js')
// const tokens = require('./assets/js/tokens.js')

export default {
  name: 'app',
  data () {
    return {
      country_flag: '',
      country: null,
      countries: [],
      by_countries: true,
      source: null,
      sources: [],
      by_sources: false,
      drawer: null,
      alert: false,
      alert_message: '',
      dialog: false,
      dialog1: false,
      push_enabled: false
    }
  },
  watch: {
    country (index, oldIndex) {
      this.$store.commit('setFetchFromNetwork', oldIndex === null || oldIndex !== null)
      for (const item of apiCountries.list()) {
        if (this.showFavorites) {
          this.$router.replace('/')
        }
        if (item.index === index) {
          this.source = null
          this.by_countries = true
          this.by_sources = false
          const name = item.name.replace(/ /g, '_').toLowerCase()
          this.country_flag = `./static/flags/${name}.gif`
          this.$store.commit('setShowFavorites', false)
          this.$store.commit('setCountry', {index: index, name: item.name})
          this.$store.commit('setSource', {})
        }
      }
    },
    source (index, o) {
      for (const item of apiSources.list()) {
        if (item.index === index) {
          if (this.showFavorites) {
            this.$router.replace('/')
          }
          this.country = null
          this.by_countries = false
          this.by_sources = true
          this.$store.commit('setShowFavorites', false)
          this.$store.commit('setFetchFromNetwork', false)
          this.$store.commit('setSource', {index: index, source: item.source})
        }
      }
    }
  },
  computed: {
    selectedCountry () {
      return this.$store.getters.getCountry
    },
    selectedSource () {
      return this.$store.getters.getSource
    },
    fetchFavorites () {
      return this.$store.getters.getFavorites
    },
    showFavorites () {
      return this.$store.getters.getShowFavorites
    }
  },
  methods: {
    home () {
      this.by_countries = true
      this.$router.replace('/')
      this.$store.commit('setShowFavorites', false)
    },
    openFavorites () {
      if (this.fetchFavorites.length === 0) {
        this.dialog1 = true
        return
      }
      this.by_countries = false
      this.by_sources = false
      this.$store.commit('setShowFavorites', true)
      this.$router.push('/favorites')
    },
    favorites () {
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-favorites', 'readwrite')
        const store = transaction.objectStore('nkatar-favorites')
        return store.getAll()
      }).then((fav) => {
        this.$store.commit('setFavorites', fav)
      })
    },
    displayCountry (value) {
      if (value.name === 'United States of America') {
        return 'USA'
      } else if (value.name === 'United Arab Emirates') {
        return 'UAE'
      } else {
        return value.name
      }
    },
    displaySource (value) {
      return value.source
    },
    getLocation () {
      this.$store.commit('setCountry', {index: 'ng', name: 'Nigeria'})
      this.country_flag = './static/flags/nigeria.gif'
      // if (navigator.onLine) {
      //   if (navigator.geolocation) {
      //     navigator.geolocation.getCurrentPosition((position) => {
      //       fetch(`https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${position.coords.latitude}&lng=${position.coords.longitude}&username=${tokens.geoNamesUserName()}`)
      //         .then((response) => {
      //           if (!response) return
      //           return response.json()
      //         })
      //         .then((data) => {
      //           const name = data.geonames[0].countryName.replace(/ /g, '_').toLowerCase()
      //           const index = data.geonames[0].countryCode.toLowerCase()
      //           for (const item of apiCountries.list()) {
      //             if (item.index === index) {
      //               this.country_flag = `./static/flags/${name}.gif`
      //               this.$store.commit('setCountry', {index: index, name: name})
      //             } else {
      //               this.$store.commit('setCountry', {index: 'ng', name: 'Nigeria'})
      //               this.country_flag = './static/flags/nigeria.gif'
      //             }
      //           }
      //         })
      //     })
      //   } else {
      //     this.$store.commit('setCountry', {index: 'ng', name: 'Nigeria'})
      //     this.country_flag = './static/flags/nigeria.gif'
      //     this.alert = true
      //     this.alert_message = 'Geolocation is not supported by this browser.'
      //   }
      // }
    },
    loadSources () {
      for (const item of apiSources.list()) {
        this.sources.push({text: item.source, value: item.index})
      }
    },
    loadCountries () {
      for (const item of apiCountries.list()) {
        this.countries.push({text: item.name, value: item.index})
      }
    },
    subscribeUser () {
      this.dialog = false
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.subscribe({
            userVisibleOnly: true
          }).then((sub) => {
            // console.log('Endpoint URL: ', sub.endpoint)
            this.$store.commit('setEndPointUrl', sub.endpoint)
          }).catch((e) => {
            if (Notification.permission === 'denied') {
              console.warn('Permission for notifications was denied')
            } else {
              console.error('Unable to subscribe to push notification', e)
            }
          })
        })
      }
    },
    registerSW () {
      if (!navigator.serviceWorker) return

      navigator.serviceWorker.register('/sw.js').then((reg) => {
        // console.log('SW registered from Home: ', reg)
        if (!navigator.serviceWorker.controller) {
          return
        }

        if (reg.waiting) {
          // indexController._updateReady(reg.waiting)
          // return
        }

        if (reg.installing) {
          // indexController._trackInstalling(reg.installing)
          // return
        }

        reg.addEventListener('updatefound', () => {
          // indexController._trackInstalling(reg.installing)
        })

        reg.pushManager.getSubscription().then((sub) => {
          if (sub === null) {
            // Update UI to ask user to register for Push
            this.push_enabled = false
            console.log('Not subscribed to push service!')
          } else {
            // We have a subscription, update the database
            this.push_enabled = true
            this.$store.commit('setEndPointUrl', sub.endpoint)
          }
        })
      })
    }
  },
  mounted () {
    this.favorites()
    this.loadCountries()
    this.loadSources()
    this.registerSW()
    this.getLocation()
    Notification.requestPermission((status) => {
      console.log('Notification permission status:', status)
    })
  }
}
</script>

<style scoped>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.icon-text {
  text-align: right;
}

</style>
