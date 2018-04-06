import Vue from 'vue'
import RaptorVue from './vue-raptor'
import VueCustomElement from 'vue-custom-element'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm'

// RaptorWidget
import RaptorWidget from './views/widgets/RaptorboxChart'

Vue.use(VueCustomElement)
Vue.use(RaptorVue)
Vue.use(BootstrapVue)
Vue.customElement('raptorbox-chart', RaptorWidget)
