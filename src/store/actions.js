export const actions = {
  country ({commit}, payload) {
    commit('setCountry', payload)
  },
  source ({commit}, payload) {
    commit('setSource', payload)
  },
  favorites ({commit}, payload) {
    commit('setFavorites', payload)
  },
  showFavorites ({commit}, payload) {
    commit('setShowFavorites', payload)
  },
  fetchFromNetwork ({commit}, payload) {
    commit('setFetchFromNetwork', payload)
  },
  endPointUrl ({commit}, payload) {
    commit('setEndPointUrl', payload)
  }
}
