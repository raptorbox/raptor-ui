// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm'
import RaptorVue from './vue-raptor'
import LoggerVue from './vue-logger'
import App from './App'
import router from './router'
import store from './store'
// confirm dialog box
import VuejsDialog from 'vuejs-dialog'

// Import the styles directly. (Or you could add them via script tags.)
// import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(LoggerVue)
Vue.use(BootstrapVue)
Vue.use(RaptorVue)
Vue.use(VuejsDialog)

var SimpleVueValidation = require('simple-vue-validator')
Vue.use(SimpleVueValidation)

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
