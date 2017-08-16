
import Raptor from 'raptor-sdk'

class VueRaptor {
  install (Vue, options) {
    options = options || {}

    let url = ''
    if (process && process.env && process.env.RAPTOR) {
      url = process.env.RAPTOR.url
    }

    let token = null
    if (localStorage.raptor) {
      try {
        const loginInfo = JSON.parse(localStorage.raptor)
        token = loginInfo.token ? loginInfo.token : null
      } catch (e) {}
    }

    const raptor = new Raptor(Object.assign({
      url: url,
      token: token
    }, options))

    Vue.mixin({
      $raptor: raptor
    })

    Vue.raptor = Vue.prototype.$raptor = raptor
  }
}

export default new VueRaptor()
