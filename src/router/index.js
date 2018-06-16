import Vue from 'vue'
import Router from 'vue-router'
import TopHeadlines from '@/components/TopHeadlines'
import Global from '@/components/Global'
import Local from '@/components/Local'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: TopHeadlines
    },
    {
      path: '/top_headlines',
      name: 'TopHeadlines',
      component: TopHeadlines
    },
    {
      path: '/global',
      name: 'Global',
      component: Global
    },
    {
      path: '/local',
      name: 'Local',
      component: Local
    }
  ]
})
