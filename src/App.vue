<template>
  <div id="app">
    <v-app id="inspire">
      <div>
        <v-toolbar color="cyan" dark tabs fixed>
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <v-toolbar-title>Nkatar</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
        </v-toolbar>
        <v-navigation-drawer v-model="drawer" temporary absolute>
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
      </div>
      <router-view></router-view>
    </v-app>
  </div>
</template>

<script>
const apiCountries = require('./assets/js/api_countries.js')

export default {
  name: 'app',
  data () {
    return {
      country: null,
      countries: [],
      source: null,
      sources: [],
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' }
      ]
    }
  },
  watch: {
    country (index, o) {
      for (const item of apiCountries.list()) {
        if (item.index === index) {
          this.$store.commit('setCountry', {index: index, name: item.name})
        }
      }
    }
  },
  methods: {
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

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
</style>
