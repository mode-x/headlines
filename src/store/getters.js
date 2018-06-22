export const getters = {
  getCountry (state) {
    return state.country
  },
  getSource (state) {
    return state.source
  },
  getFavorites (state) {
    return state.favorites
  },
  getShowFavorites (state) {
    return state.show_favorites
  },
  getFetchFromNetwork (state) {
    return state.fetch_from_network
  },
  getEndPointUrl (state) {
    return state.endpoint_url
  }
}
