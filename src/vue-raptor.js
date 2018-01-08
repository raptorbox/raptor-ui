
import Raptor from 'raptor-sdk'

class VueRaptor {
  install (Vue, options) {
    options = options || {}

    let url = null
    if (process && process.env && process.env.RAPTOR && process.env.RAPTOR.url) {
      url = process.env.RAPTOR.url
    }

    let token = null
    if (localStorage.raptor) {
      try {
        const loginInfo = JSON.parse(localStorage.raptor)
        token = loginInfo.token ? loginInfo.token : null
      } catch (e) {}
    }

    const raptor = new Raptor(Object.assign({ url, token }, options))

    raptor.on('request.error', (err) => {
      if (err.code && err.code === 401) {
        if (raptor.Auth().loginIsExpired()) {
          Vue.log.warn('Request failed, login expired')

          let pos = location.hash.indexOf('?') - 1
          pos = pos >= 0 ? pos : location.hash.length - 1
          const redir = '?' + location.hash.substr(1, pos)

          Vue.router.push('/pages/login' + redir)
        }
      }
    })

    Vue.mixin({
      $raptor: raptor
    })

    Vue.raptor = Vue.prototype.$raptor = raptor
  }
}

export default new VueRaptor()
