
import * as log from 'loglevel'

class VueLogger {
  install (Vue, options) {
    options = options || {}

    let logLevel = 'info'
    if (process && process.env) {
      log.setDefaultLevel(process.env.NODE_ENV === 'development' ? 'trace' : 'info')
      log.debug('Debug enabled')
      logLevel = process.env.NODE_ENV === 'development' ? 'trace' : 'info'
    }

    if (options.level) {
      logLevel = options.level
    }

    log.debug('Set level to %s', logLevel)
    log.setLevel(logLevel)

    Vue.mixin({
      $log: log
    })

    Vue.log = Vue.prototype.$log = log
  }
}

export default new VueLogger()
