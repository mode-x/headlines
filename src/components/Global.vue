<template>
  <div id="global">
    <v-app id="inspire">
      <v-container grid-list-md text-xs-center>
        <v-layout row wrap>
          <v-flex xs12 sm12 md12>
            <h1>{{title}}</h1>
          </v-flex>
          <v-flex xs12 sm6 md3  v-for="(top_headline, index) in top_headlines.articles" :key="index">
            <v-card dark color="secondary" style="height: 450px; padding-bottom: 16px;">
              <v-card-media :src=top_headline.urlToImage height="180px">
              </v-card-media>
              <v-card-title primary-title class="card-title">
                {{ top_headline.title }}
              </v-card-title>
              <v-card-text class="card-text truncate">
                <!-- {{ top_headline.description }} -->
              </v-card-text>
              <v-card-actions class="d-flex align-items-end">
                <v-btn flat color="orange">Share</v-btn>
                <v-btn flat color="orange" to="/top_headlines">Read</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-app>
  </div>
</template>

<script>
// import idb from 'idb'

export default {
  name: 'global',
  data () {
    return {
      title: 'Global News',
      model: 'tab-1',
      url: 'http://newsapi.org/v2/everything',
      top_headlines: [],
      streamData: null
    }
  },
  methods: {
    openSocket () {

    }
  },
  mounted () {
    this.openSocket()
  }
}
</script>

<style>
#home {
  margin-top: 150px;
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
