onmessage = (e) => {
  if (navigator.onLine) {
    let newsUrl
    if (e.data[0]) {
      newsUrl = `https://newsapi.org/v2/top-headlines?sources=${e.data[0]}&apiKey=${e.data[2]}`
    } else {
      newsUrl = `https://newsapi.org/v2/top-headlines?country=${e.data[1]}&apiKey=${e.data[2]}`
    }
    fetch(newsUrl)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        postMessage(data)
      })
  }
}
