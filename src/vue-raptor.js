
import Raptor from 'raptor-sdk'

class VueRaptor {
  install (Vue, options) {
    options = options || {}

    let url = ''
    if (process && process.env && process.env.RAPTOR) {
      url = process.env.RAPTOR.url
    }

    const raptor = new Raptor(Object.assign({
      url: url
    }, options))

    Vue.mixin({
      $raptor: raptor
    })

    Vue.raptor = Vue.prototype.$raptor = raptor
  }
}

export default new VueRaptor()
