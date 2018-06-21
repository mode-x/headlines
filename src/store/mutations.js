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
  setShowFavorites (state, payload) {
    state.show_favorites = payload
  },
  setFetchFromNetwork (state, payload) {
    state.fetch_from_network = payload
  },
  setEndPointUrl (state, payload) {
    state.endpoint_url = payload
  }
}
