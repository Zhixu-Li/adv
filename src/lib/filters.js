import Vue from 'vue'
import moment from 'moment'

let pad = (num) => {
  return ('0' + num).slice(-2)
}

const filters = {
  humanFileSize (bytes) {
    let thresh = 1000
    let units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B'
    }

    do {
      bytes /= thresh
      ++u
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)

    return bytes.toFixed(1) + ' ' + units[u]
  },
  time (seconds) {
    let minutes = Math.floor(seconds / 60)
    let secs = seconds % 60
    minutes = minutes % 60

    return pad(minutes) + ':' + pad(secs)
  },
  money (cents) {
    let cost = (Math.round((cents / 100) * 100) / 100)
    return cost < 0 ? 0 : cost
  },
  date (date) {
    return moment(date).format('DD-MM-YYYY')
  },
  formatDate (date, format) {
    return moment(date).format(format)
  },
  percent (num) {
    return num + '%'
  }
}

for (let [key, value] of Object.entries(filters)) {
  Vue.filter(key, value)
}
