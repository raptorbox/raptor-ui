// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import RaptorVue from './vue-raptor'
import LoggerVue from './vue-logger'
import App from './App'
import router from './router'
import store from './store'
import ClickConfirm from 'click-confirm'
// import * as admin from 'firebase'

// import serviceAccount from 'config/raptorbox-ui-firebase-adminsdk-jq1dl-893008b445.json'

Vue.use(LoggerVue)
Vue.use(BootstrapVue)
Vue.use(RaptorVue)
Vue.component('clickConfirm', ClickConfirm)

var SimpleVueValidation = require('simple-vue-validator')
Vue.use(SimpleVueValidation)

// let config = {
//   apiKey: 'AIzaSyBFuMvrB8uqWeIVEitgtU_DAstEih-nwfE',
//   authDomain: 'raptorui-17f39.firebaseapp.com',
//   databaseURL: 'https://raptorui-17f39.firebaseio.com',
//   projectId: 'raptorui-17f39',
//   storageBucket: 'raptorui-17f39.appspot.com',
//   messagingSenderId: '620226975888'
// }
// var app = admin.initializeApp(config)

// var db = app.database()
// Vue.use(db)

// Vue.mixin({
//   $dbFirebase: db
// })

// Vue.dbFirebase = Vue.prototype.$dbFirebase = db

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
