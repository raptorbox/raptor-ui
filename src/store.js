
// import Vue from 'vue'
// import Vuex from 'vuex'
// import Raptor from 'raptor-sdk'
//
// Vue.use(Vuex)
//
//
// const store = new Vuex.Store({
//   state: {
//     users: {
//       list: [],
//       edit: newUser()
//     }
//   },
//   mutations: {
//     editUser (state, u) {
//       if (u !== null) {
//         state.users.edit = Object.assign({}, u)
//       } else {
//         // reset values
//         const u2 = newUser()
//         Object.keys(u2).forEach((k) => {
//           state.users.edit[k] = null
//         })
//         console.warn('reset USER', state.users.edit)
//       }
//     }
//   },
//   getters: {
//   }
// })

import Raptor from 'raptor-sdk'

const newUser = () => {
  const u = {}
  Object.keys((new Raptor.models.User()).defaultFields()).forEach((k) => {
    u[k] = null
  })
  return u
}

const store = {
  users: {
    list: [],
    edit: newUser()
  }
}

export default store
