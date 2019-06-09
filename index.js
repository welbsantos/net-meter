const {ipcRenderer, shell} = require('electron')
const netstat = require ('./netstat')

let actual_stat = {
  bytes_in: 0,
  bytes_out:0
}

let previous_stat = {
  bytes_in: 0,
  bytes_out:0
}

let statistics

let max_rate_bytes_in = 0
let max_rate_bytes_out = 0

const interval = 1 // in seconds

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

  previous_stat.bytes_in = actual_stat.bytes_in
  previous_stat.bytes_out = actual_stat.bytes_out

  actual_stat = netstat.getStatistics()

  let rate_bytes_in
  let rate_bytes_out

  if (previous_stat.bytes_in == 0) { 
    rate_bytes_in = 0 
  } else {
    rate_bytes_in = Math.round((actual_stat.bytes_in - previous_stat.bytes_in) / interval)
  }

  if (previous_stat.bytes_out == 0) { 
    rate_bytes_out = 0 
  } else {
    rate_bytes_out = Math.round((actual_stat.bytes_out - previous_stat.bytes_out) / interval)
  }

  if (rate_bytes_in > max_rate_bytes_in) { max_rate_bytes_in = rate_bytes_in }
  if (rate_bytes_out > max_rate_bytes_out) { max_rate_bytes_out = rate_bytes_out }

  statistics = {
    timestamp: new Date().toLocaleTimeString(),
    bytes_in: actual_stat.bytes_in,
    bytes_out: actual_stat.bytes_out,
    previous_bytes_in: previous_stat.bytes_in,
    previous_bytes_out: previous_stat.bytes_out,
    rate_bytes_in: rate_bytes_in,
    rate_bytes_out: rate_bytes_out,
    max_rate_bytes_in: max_rate_bytes_in,
    max_rate_bytes_out: max_rate_bytes_out
  }

  updateView(statistics)
}

const updateView = (stat) => {

  document.querySelector('.js-update-time').textContent = stat.timestamp
  
  document.querySelector('.js-net-meter-bytes-in').textContent = stat.bytes_in
  document.querySelector('.js-net-meter-bytes-out').textContent = stat.bytes_out

  document.querySelector('.js-net-meter-bytes-in-rate').textContent = stat.rate_bytes_in
  document.querySelector('.js-net-meter-bytes-out-rate').textContent = stat.rate_bytes_out

  document.querySelector('.js-net-meter-max-bytes-in-rate').textContent = stat.max_rate_bytes_in
  document.querySelector('.js-net-meter-max-bytes-out-rate').textContent = stat.max_rate_bytes_out
  
}

// Refresh statistics
setInterval(updateStatistics, interval * 1000)

// Update initial statistics when loaded
document.addEventListener('DOMContentLoaded', updateStatistics)
