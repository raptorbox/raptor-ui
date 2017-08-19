// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import RaptorVue from './vue-raptor'
import LoggerVue from './vue-logger'
import App from './App'
import router from './router'
import store from './store'

Vue.use(LoggerVue)
Vue.use(BootstrapVue)
Vue.use(RaptorVue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  data: store,
  template: '<App/>',
  components: {
    App
  }
})
