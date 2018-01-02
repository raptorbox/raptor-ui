<template>
  <header class="app-header navbar">

    <button class="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button" @click="mobileSidebarToggle">&#9776;</button>
    <b-link class="navbar-brand" to="#"></b-link>
    <button class="navbar-toggler sidebar-toggler d-md-down-none" type="button" @click="sidebarMinimize">&#9776;</button>

    <b-navbar-nav class="d-md-down-none">
      <b-nav-item class="px-3">
        <router-link to="/dashboard">Dashboard</router-link>
      </b-nav-item>
      <b-nav-item class="px-3">
        <router-link to="/inventory">Inventory</router-link>
      </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
      <b-nav-item-dropdown right>
        <template slot="button-content">
          <span class="d-md-down-none">{{username}}</span>
        </template>
        <!-- <b-dropdown-header tag="div" class="text-center"><strong>Account</strong></b-dropdown-header> -->
        <b-dropdown-item @click="logout"><i class="fa fa-lock"></i> Logout</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>

    <!-- <button class="navbar-toggler aside-menu-toggler d-md-down-none" type="button" @click="asideToggle">&#9776;</button> -->
  </header>
</template>
<script>
  export default {
    name: 'header',
    data() {
      return {
        username: null
      }
    },
    mounted() {
      this.username = this.$raptor.Auth().getUser().username
    },
    methods: {
      sidebarToggle (e) {
        e.preventDefault()
        document.body.classList.toggle('sidebar-hidden')
      },
      sidebarMinimize (e) {
        e.preventDefault()
        document.body.classList.toggle('sidebar-minimized')
      },
      mobileSidebarToggle (e) {
        e.preventDefault()
        document.body.classList.toggle('sidebar-mobile-show')
      },
    /*asideToggle (e) {
      e.preventDefault()
      document.body.classList.toggle('aside-menu-hidden')
    },*/
    logout () {
      this.$raptor.Auth().logout();
      this.$router.push("/pages/login");
    }
  }
}
</script>
