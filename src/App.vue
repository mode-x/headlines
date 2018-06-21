<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" temporary app>
      <template>
        <v-container fluid>
          <v-layout row wrap>
            <v-flex xs12 mt-5>
              <span text-color="primary">Countries</span>
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
              <span text-color="primary">Sources</span>
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
            <v-flex xs12 mt-5>
              <v-chip color="primary" text-color="white" style="width: 100%;">
                {{ favs.length }} Favorite(s)
                <v-icon color="red" right align-end>favorite</v-icon>
              </v-chip>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
    <v-toolbar color="blue" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Nkatar</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="by_countries">
        <span class="pr-2">{{ `Country: ${displayCountry(selectedCountry)}` }}</span>
        <img :src=country_flag width="25"/>
      </template>
      <template v-if="by_sources">
        <span class="pr-2">{{ `Source: ${displaySource(selectedSource)}` }}</span>
      </template>
      <!-- <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn> -->
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
    <v-footer color="blue" app>
      <span class="white--text">&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
const apiCountries = require('./assets/js/api_countries.js')
const apiSources = require('./assets/js/api_sources.js')

const idb = require('./assets/js/idb.js')

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
      favs: []
    }
  },
  watch: {
    country (index, o) {
      for (const item of apiCountries.list()) {
        if (item.index === index) {
          this.source = null
          this.by_countries = true
          this.by_sources = false
          this.$store.commit('setFetchFromNetwork', true)
          const name = item.name.replace(/ /g, '_').toLowerCase()
          this.country_flag = `./static/flags/${name}.gif`
          this.$store.commit('setCountry', {index: index, name: item.name})
          this.$store.commit('setSource', {})
        }
      }
    },
    source (index, o) {
      for (const item of apiSources.list()) {
        if (item.index === index) {
          this.country = null
          this.by_countries = false
          this.by_sources = true
          this.$store.commit('setFetchFromNetwork', true)
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
    }
  },
  methods: {
    favorites () {
      idb.indexDb().then((db) => {
        const transaction = db.transaction('nkatar-favorites', 'readwrite')
        const store = transaction.objectStore('nkatar-favorites')
        return store.getAll()
      }).then((fav) => {
        this.favs = fav
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
      this.$store.commit('setFetchFromNetwork', false)
      this.$store.commit('setCountry', {index: 'ng', name: 'Nigeria'})
      this.country_flag = './static/flags/nigeria.gif'
      if (navigator.onLine) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            fetch(`https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${position.coords.latitude}&lng=${position.coords.longitude}&username=nasefx`)
              .then((response) => {
                if (!response) return
                return response.json()
              })
              .then((data) => {
                const name = data.geonames[0].countryName
                this.country_flag = `./static/flags/${name.replace(/ /g, '_').toLowerCase()}.gif`
                this.$store.commit('setCountry', {index: data.geonames[0].countryCode.toLowerCase(), name: name})
              })
          })
        } else {
          this.alert = true
          this.alert_message = 'Geolocation is not supported by this browser.'
        }
      }
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
    registerSW () {
      if (!navigator.serviceWorker) return

      navigator.serviceWorker.register('/sw.js').then(function (reg) {
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

        reg.addEventListener('updatefound', function () {
          // indexController._trackInstalling(reg.installing)
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
  }
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.chip__content {
  width: 98%!important;
}

</style>
