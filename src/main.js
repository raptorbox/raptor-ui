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
import * as admin from 'firebase'
// import serviceAccount from 'config/raptorbox-ui-firebase-adminsdk-jq1dl-893008b445.json'

Vue.use(LoggerVue)
Vue.use(BootstrapVue)
Vue.use(RaptorVue)
Vue.component('clickConfirm', ClickConfirm)

var SimpleVueValidation = require('simple-vue-validator')
Vue.use(SimpleVueValidation)

let config = {
  apiKey: 'AIzaSyBFuMvrB8uqWeIVEitgtU_DAstEih-nwfE',
  authDomain: 'raptorui-17f39.firebaseapp.com',
  databaseURL: 'https://raptorui-17f39.firebaseio.com',
  projectId: 'raptorui-17f39',
  storageBucket: 'raptorui-17f39.appspot.com',
  messagingSenderId: '620226975888'
}
var app = admin.initializeApp(config)

// var serviceAccount = {
//   'type': 'service_account',
//   'project_id': 'raptorui-17f39',
//   'private_key_id': '7367b81ad28dc62dbf230c5c8bea40368dc0d64e',
//   'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDFh8Mo72nm7oWg\nJzdniAbrH8lUbviLD8sWZxuvbZyiHIQbOVWKbfuUhE1dHnh+Vivmum88VJP2xtxP\nNL36fCqs0BMrxfRGv0y/+kSocCFuJZFTGoe2XNknkZ25e+v50lkhE+PpqblY4Els\nUFOmnxjXM5ZWF1bhf2rj5MMPK/7xUOeJeFQxfW+1s3v5OrJHi4ryDzVwaMwWZ5Y3\nQ2vuioncZ71iNhA37YwGiz3DKfV2/KHnVfZvcwKM1oPo3e8byRR+6HHT8OESUhEG\nFpDUWfoPwAJ05wkmuTNkXwP+pbPriN2r8xDkvQeV4erdg7IBXSFP/RNnJbkj97bd\n1vpDvel3AgMBAAECggEAE5C0w8UH2btK4KfujlwXe1b4EfUcvAF1ENbNRwOpBEs/\nMC2H2IdRgc6jYkbWkbgm7w3Zkls6SkyjA8FqOkZUOWIx+lL7aCQiQQQg16I+3XJU\nW6vnQPWFzBKM63nONnEfkCD9Os0rfuJWw3Pzy5XUpKdtpUD4kET9QtQ+fq4EuZHC\nPtg1++W2sU4/AL2kSxNAwpYzWin9nGw4TidWqLpEOYVhrtRF2grFrk/PIXhmTRU+\nszU46sJ9dU6DGfLrz3BTCaohKFm9EFsjBj3EGZW44cF5PhA7DDJMUVxop2HOKFce\n5Qi1b8t+WhX6ZxOsbrPRhCUNVOOM4Y0t2233Sy36MQKBgQDy/xDgABwv3gz848qz\nCXNVPSl2pXZ1lYSZ7ijfLONaMUjUo4RJkwkd/lZrcV5zAA6B+5Q1tdJ5L1avrEv/\nQH2MEZvBCuTuptLrNirlRywHEdOFQeQe/yRDw4kR59j+ATpbKMKDa6frZ5dw7A5g\ni69Je+LcBJ4TbUqsY7TTGMRUvwKBgQDQGdVg/aSRgeC1b6CvMnBtsoppfgwRRIgI\nA93jPR3ompSozTmFp9dbCTZdpYWi+xvRG70cMg0O2+EwtqZTzos0XSnP0aXiS18W\nG/yVO3EhjkesxTlvg1RlrRBj8YWLnA+dWNegtMbYjjAtKFfo6ee6SK/MDlhI8D5P\nWWJZ6tMBSQKBgCbfTt/GpLuzlfhOqHqDpIOaSSvFxHGC/bdyNe+dyrD++Vuq3Nq4\nPtkhesmtVSKoe6mniUoeUBE61W887NtkgbEKkBQNnhnfbhZaj/olrJFk9KV4qPmc\nbzy35xGKOVhI8gDrQFKtwisSY1OZL6OaNOxYeS4hPvh0n2F8gczTRXUZAoGAF73q\nxz8I6ITt0yViKrrRcuJ8wh5cWBf+gROX3BYb9G62aS/I0UPd4QgDCNoajgaiHNBS\nWgYn0TsqzPj5rvQQk6/RVmFv0IqS1Z3pykjW1mI6MS7rJ5rPJS6CgTSL7OqoKWZ6\na15UlV5bhrtklDEje/BRBjHYxrGKGllzTBjra+kCgYAtQQWGNJYicCAxcm+jmxV0\n1Jd9WubaofK7W3xvF6QytSg0GMvH7Ru14uCUvaQW5Ok1FE67XSX9spnOid6aiibU\ns9Mpu0QXZdil+Deqj7XCwHvzQzwYfsUefs+zzya/sihQ6USBw1nwTfSNNX49fyJ9\nmr9J4yEP40LBl13XssC/2w==\n-----END PRIVATE KEY-----\n',
//   'client_email': 'firebase-adminsdk-tfijz@raptorui-17f39.iam.gserviceaccount.com',
//   'client_id': '110244263782947254575',
//   'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
//   'token_uri': 'https://accounts.google.com/o/oauth2/token',
//   'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
//   'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-tfijz%40raptorui-17f39.iam.gserviceaccount.com'
// }

// var app = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://raptorbox-ui.firebaseio.com'
// })

var db = app.database()
Vue.use(db)

Vue.mixin({
  $dbFirebase: db
})

Vue.dbFirebase = Vue.prototype.$dbFirebase = db

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
