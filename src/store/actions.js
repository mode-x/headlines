export const actions = {
  country ({commit}, payload) {
    commit('setCountry', payload)
  },
  source ({commit}, payload) {
    commit('setSource', payload)
  },
  fetchFromNetwork ({commit}, payload) {
    commit('setFetchFromNetwork', payload)
  }
}
