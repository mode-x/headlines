export const mutations = {
  setCountry (state, payload) {
    state.country = payload
  },
  setSource (state, payload) {
    state.source = payload
  },
  setFavorites (state, payload) {
    state.favorites = payload
  },
  setFetchFromNetwork (state, payload) {
    state.fetch_from_network = payload
  }
}
