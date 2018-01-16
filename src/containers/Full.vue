<template>
  <div class="app">
    <AppHeader/>
    <div class="app-body">
      <Sidebar :navItems="nav"/>
      <main class="main">
        <breadcrumb :list="list"/>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
      <AppAside/>
    </div>
    <AppFooter/>
  </div>
</template>

<script>
import nav from '../_nav'
import { Header as AppHeader, Sidebar, Aside as AppAside, Footer as AppFooter, Breadcrumb } from '../components/'

export default {
  name: 'full',
  components: {
    AppHeader,
    Sidebar,
    AppAside,
    AppFooter,
    Breadcrumb
  },
  data () {
    return {
      nav: nav.items
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      return this.$route.matched
    }
    // nav () {
    //   return this.checkUser()
    // }
  },
  mounted() {
    this.checkUser()
  },
  methods: {
    checkUser() {
      this.user = this.$raptor.Auth().getUser()
      if(this.user.roles.indexOf('admin') < 0) {
        let nav = []
        for (var i = 0; i < this.nav.length; i++) {
          if(this.nav[i].name == 'Admin' && this.nav[i].title) {
            nav.push({
              title: true,
              name: 'User'
            })
          } else if (this.nav[i].name == 'Admin') {
            nav.push({
                  name: 'Apps',
                  url: '/admin/applications',
                  icon: 'icon-puzzle'
                })
            nav.push({
                  name: 'Tokens',
                  url: '/admin/tokens',
                  icon: 'icon-screen-smartphone'
                })
          } else {
            nav.push(this.nav[i])
          }
        }
        this.nav = nav
      }
    }
  }
}
</script>
