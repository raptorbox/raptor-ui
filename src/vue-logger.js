
import * as log from 'loglevel'

class VueLogger {
  install (Vue, options) {
    options = options || {}

    if (process && process.env && process.env.NODE_ENV) {
      log.setDefaultLevel(process.env.NODE_ENV === 'development' ? 'trace' : 'info')
    }

    if (options.level) {
      log.setLevel(options.level)
    }

    Vue.mixin({
      $log: log
    })

    Vue.log = Vue.prototype.$log = log
  }
}

export default new VueLogger()
