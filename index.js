const {ipcRenderer, shell} = require('electron')
const netstat = require ('./netstat')

document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    updateStatistics()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  }
})

const updateStatistics = () => {
  let stat = netstat.getStatistics()
  
  ipcRenderer.send('weather-updated', stat)
  updateView(stat)
}

const updateView = (stat) => {

  document.querySelector('.js-net-meter-bytes-in').textContent = stat.bytes_in
  document.querySelector('.js-net-meter-bytes-out').textContent = stat.bytes_out

}
// Refresh statistics every 1 second (1000 milliseconds)
const interval = 1000
setInterval(updateStatistics, interval)

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', updateStatistics)






/*
const {ipcRenderer, shell} = require('electron')
const request = require('request');

let previousWeather = undefined
let voice = undefined
let defaultIp = undefined

document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    updateWeather()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  }
})

const getGeoLocation = () => {
  return new Promise((resolve, reject) => {
    let results
    request('http://ipapi.co/ip', (error, response, body) => {

      if (error) { 
        console.log (error)
        reject(error) 
        return
      }

      if(body.length > 0) {
          defaultIp = body
      }

      request('http://ipapi.co/' + defaultIp +'/json/', (error, response, body) => {

        if (error) { 
          console.log(error)
          reject (error) 
          return
        }

        if(body.length > 0) {
          results = JSON.parse(body)
        }
      
      resolve(results)

      })
      
    })
    
  })
}

const getWeather = (myposition) => {
  // FIXME replace with your own API key
  // Register for one at https://developer.forecast.io/register
  const apiKey = '5f7a63588456b122f60195a525882bc6'
  const location = `${myposition.latitude},${myposition.longitude}`
  console.log(`Getting weather for ${myposition.city} (${myposition.latitude},${myposition.longitude})`)
  const url = `https://api.forecast.io/forecast/${apiKey}/${location}?units=ca&exclude=minutely,hourly,daily,alerts,flags`

  return window.fetch(url).then((response) => {
    
    let response_promise = response.json().then((response_json) => { 
      response_json.myposition = myposition 
      return response_json
    })
    return response_promise
  })
}

const updateView = (weather) => {
  const currently = weather.currently

  document.querySelector('.js-summary').textContent = currently.summary
  document.querySelector('.js-update-time').textContent = `at ${new Date(currently.time).toLocaleTimeString()}`

  document.querySelector('.js-temperature').textContent = `${Math.round(currently.temperature)}° C`
  document.querySelector('.js-apparent').textContent = `${Math.round(currently.apparentTemperature)}° C`

  document.querySelector('.js-wind').textContent = `${Math.round(currently.windSpeed)} kph`
  document.querySelector('.js-wind-direction').textContent = getWindDirection(currently.windBearing)

  document.querySelector('.js-dewpoint').textContent = `${Math.round(currently.dewPoint)}° C`
  document.querySelector('.js-humidity').textContent = `${Math.round(currently.humidity * 100)}%`

  document.querySelector('.js-visibility').textContent = `${Math.round(currently.visibility)} Km`
  document.querySelector('.js-cloud-cover').textContent = `${Math.round(currently.cloudCover * 100)}%`

  document.querySelector('.js-precipitation-chance').textContent = `${Math.round(currently.precipProbability * 100)}%`
  document.querySelector('.js-precipitation-rate').textContent = currently.precipIntensity
}

const getWindDirection = (direction) => {
  if (direction < 45) return 'NNE'
  if (direction === 45) return 'NE'

  if (direction < 90) return 'ENE'
  if (direction === 90) return 'E'

  if (direction < 135) return 'ESE'
  if (direction === 135) return 'SE'

  if (direction < 180) return 'SSE'
  if (direction === 180) return 'S'

  if (direction < 225) return 'SSW'
  if (direction === 225) return 'SW'

  if (direction < 270) return 'WSW'
  if (direction === 270) return 'W'

  if (direction < 315) return 'WNW'
  if (direction === 315) return 'NW'

  if (direction < 360) return 'NNW'
  return 'N'
}

const isWeatherIdeal = (weather) => {
  // Precipipation is never ideal...
  if (weather.currently.precipIntensity !== 0) return false

  // Ideal weather is within 3 degress of the ideal temperature
  const idealTemperature = 25
  const feelsLikeTemperature = weather.currently.apparentTemperature
  return Math.abs(idealTemperature - feelsLikeTemperature) <= 3
}

const sendNotification = (weather) => {
  if (!isWeatherIdeal(weather)) return

  // Show notification if it is the first time checking the weather or if it was
  // previously not ideal but is now ideal
  if (previousWeather == null || !isWeatherIdeal(previousWeather)) {
    const summary = weather.currently.summary.toLowerCase()
    const feelsLike = Math.round(weather.currently.apparentTemperature)
    let notification = new Notification('Go outside', {
      body: `The weather is ${summary} and feels like ${feelsLike}° C`
    })

    // Show window when notification is clicked
    notification.onclick = () => {
      ipcRenderer.send('show-window')
    }

    speakTheGoodNews(weather)
  }
}

const speakTheGoodNews = (weather) => {
  const summary = weather.currently.summary.toLowerCase()
  const feelsLike = Math.round(weather.currently.apparentTemperature)
  const utterance = new SpeechSynthesisUtterance(`Go outside! The weather is ${summary} and feels like ${feelsLike} degrees.`)
  utterance.voice = voice
  speechSynthesis.speak(utterance)
}

speechSynthesis.onvoiceschanged = () => {
  voice = speechSynthesis.getVoices().find((voice) => voice.name === 'Good News')
}

const updateWeather = () => {
  getGeoLocation().then(getWeather).then((weather) => {
    // Use local time
    weather.currently.time = Date.now()

    console.log('Got weather', weather)

    ipcRenderer.send('weather-updated', weather)
    updateView(weather)
    sendNotification(weather)
    previousWeather = weather
  })
}

// Refresh weather every 10 minutes
const tenMinutes = 10 * 60 * 1000
setInterval(updateWeather, tenMinutes)

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', updateWeather)
*/
