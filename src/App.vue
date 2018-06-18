<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" temporary app>
      <template>
        <v-container fluid>
          <v-layout row wrap>
            <v-flex xs12 mt-5>
              Countries
              <v-select
                :items="countries"
                v-model="country"
                label="Select a country"
                single-line
                auto
                prepend-icon="map"
                hide-details
                @change="drawer = !drawer"
              ></v-select>
            </v-flex>
            <v-flex xs12 mt-5>
              Sources
              <v-select
                :items="sources"
                v-model="source"
                label="Select a source"
                single-line
                auto
                prepend-icon="map"
                hide-details
              ></v-select>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <v-list class="pa-1">
      </v-list>
      <v-list class="pt-0" dense>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="blue" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Nkatar</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="pr-2">{{ defaultCountry.name }}</span>
      <img :src=country_flag width="25"/>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout
          justify-center
          align-center
        >
          <v-alert v-model="alert" type="success" dismissible>
            {{ alert_message }}
          </v-alert>
          <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="black" app>
      <span class="white--text">&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
const apiCountries = require('./assets/js/api_countries.js')

export default {
  name: 'app',
  data () {
    return {
      country_flag: '',
      country: null,
      countries: [],
      source: null,
      sources: [],
      drawer: null,
      alert: false,
      alert_message: ''
    }
  },
  watch: {
    country (index, o) {
      for (const item of apiCountries.list()) {
        if (item.index === index) {
          const name = item.name.replace(/ /g, '_').toLowerCase()
          this.country_flag = `./static/flags/${name}.gif`
          this.$store.commit('setCountry', {index: index, name: item.name})
        }
      }
    }
  },
  computed: {
    defaultCountry () {
      return this.$store.getters.getCountry
    }
  },
  methods: {
    getLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          fetch(`http://ws.geonames.org/findNearbyPlaceNameJSON?lat=${position.coords.latitude}&lng=${position.coords.longitude}&username=nasefx`)
            .then((response) => {
              if (!response) return
              return response.json()
            })
            .then((data) => {
              this.$store.commit('setCountry', {index: data.geonames[0].countryCode.toLowerCase(), name: data.geonames[0].countryName})
            })
        })
      } else {
        this.alert = true
        this.alert_message = 'Geolocation is not supported by this browser.'
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
        console.log('SW registered from top headlines: ', reg)
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
    this.loadCountries()
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

</style>
