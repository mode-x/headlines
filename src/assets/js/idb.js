import idb from 'idb'

export function indexDb () {
  return idb.open('nkatar', 1, function (upgradeDb) {
    let topHeadLinesStore = upgradeDb.createObjectStore('nkatar-top-headlines', {
      keyPath: 'title'
    })
    let favoritesStore = upgradeDb.createObjectStore('nkatar-favorites', {
      keyPath: 'title'
    })
    topHeadLinesStore.createIndex('by_date', 'publishedAt')
    favoritesStore.createIndex('by_date', 'publishedAt')
  })
}
