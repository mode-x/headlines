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
  getfetchFromNetwork (state) {
    return state.fetch_from_network
  }
}
