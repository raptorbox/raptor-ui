import Vue from 'vue'
import RaptorVue from './vue-raptor'
import VueCustomElement from 'vue-custom-element'

// RaptorWidget
import RaptorWidget from './views/widgets/RaptorboxChart'

Vue.use(VueCustomElement)
Vue.use(RaptorVue)
Vue.customElement('raptorbox-chart', RaptorWidget)
