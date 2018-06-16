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
          <v-tabs
            slot="extension"
            icons-and-text
            centered
            color="cyan"
            slider-color="orange"
          >
            <v-tab to="/top_headlines">
              Top Headlines
              <v-icon>spa</v-icon>
            </v-tab>
            <v-tab to="/global">
              Global
              <v-icon>language</v-icon>
            </v-tab>
            <v-tab to="/local">
              Local
              <v-icon>place</v-icon>
            </v-tab>
          </v-tabs>
        </v-toolbar>
        <v-navigation-drawer v-model="drawer" temporary absolute>
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
export default {
  name: 'app',
  data () {
    return {
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' }
      ]
    }
  },
  methods: {
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
