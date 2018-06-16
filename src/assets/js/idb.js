import idb from 'idb'

export function indexDb () {
  return idb.open('nkatar', 1, function (upgradeDb) {
    let store = upgradeDb.createObjectStore('nkatar-top-headlines', {
      keyPath: 'title'
    })
    store.createIndex('by_date', 'publishedAt')
  })
}
