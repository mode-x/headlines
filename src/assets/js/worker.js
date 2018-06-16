const idb = require('../assets/js/idb.js')

onmessage = function (e) {
  // console.log('Message received from main script')
  // var workerResult = 'Result: ' + (e.data[0] * e.data[1])
  // console.log('Posting message back to main script')
  // setTimeout(() => {
  //   fetch(`https://newsapi.org/v2/top-headlines?country=${this.country}&apiKey=8f9773109c594f5cad47ace0c1970333`)
  //     .then((response) => {
  //       console.log(response)
  //       return response.json()
  //     })
  //     .then((data) => {
  //       data = data.articles
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  // }, 1000)

  setInterval(() => {
    fetch(`https://newsapi.org/v2/top-headlines?country=${e}&apiKey=8f9773109c594f5cad47ace0c1970333`)
      .then((response) => {
        console.log(response)
        if (!response) {
          return
        }
        return response.json()
      })
      .then((data) => {
        postMessage(data.articles)
        // console.log(data)
        idb.indexDb().then((db) => {
          const transaction = db.transaction('nkatar-top-headlines', 'readwrite')
          const store = transaction.objectStore('nkatar-top-headlines')
          data.articles.forEach((article) => {
            store.put(article)
          })
          // limit store to 20 items
          store.index('by_date').openCursor(null, 'prev').then(function (cursor) {
            return cursor.advance(20)
          }).then(function deleteRest (cursor) {
            if (!cursor) return
            cursor.delete()
            return cursor.continue().then(deleteRest)
          })
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }, 5000)
}
