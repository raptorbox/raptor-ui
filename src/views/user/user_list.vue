<template>
    <div class="animated fadeIn row row-fluid">
        <div class="col-lg-12">

            <b-card>

                <div slot="header">

                    <div class="row row-fluid">
                        <div class="col-lg-8 list-inline">
                            <div>
                                <div class="col-md-3">
                                    <h3 class="list-inline-item"><i class="fa fa-users"></i> Users</h3>
                                </div>
                              <!-- <div class="row-fluid" v-if="appId && app">
                                <strong>Application: </strong>
                                <span>{{app.name}}</span>
                              </div> -->
                            </div>
                            <span v-if="appId">
                                <b-button class="list-inline-item" variant="primary" :to="{ name: 'UsersCreateWithAppId', params: {appId: appId}}">
                                    <i class="fa fa-plus"></i> New
                                </b-button>
                            </span>
                            <span v-else>
                                <b-button class="list-inline-item" variant="primary" :to="{ name: 'UsersCreate'}">
                                    <i class="fa fa-plus"></i> New
                                </b-button>
                            </span>
                        </div>
                        <div class="col-md-4 text-right">
                            <b-form-fieldset description="Items per page" label="Show" horizontal>
                                <b-form-select :options="pageOptions" v-model="perPage" @change="itemsLimitChange"/>
                            </b-form-fieldset>
                        </div>
                    </div>

                </div>

                <b-table no-local-sorting small responsive show-empty :items="list" :fields="fields" @sort-changed="sortingChanged">

                    <template slot="id" scope="row">
                        <b-badge size="sm" variant="light" :to="{ name: 'UsersUpdate', params: { userId: row.item.id, appId: appId }}">{{row.item.id}}</b-badge>
                    </template>
                    <template slot="username" scope="row" v-if="row.item.username">
                        <span v-if="row.item.username">
                            <b-button variant="link" :to="{ name: 'UsersUpdate', params: { userId: row.item.id, appId: appId }}">
                                {{row.item.username}}
                            </b-button>
                        </span>
                    </template>
                    <template slot="roles" scope="row">
                        <b-badge v-for="role in row.item.roles" :key="role.name" :variant="role.name === 'admin' ? 'info' : 'light'">
                            {{ role.name }}
                        </b-badge>
                    </template>
                    <template slot="status" scope="row">
                        <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
                    </template>
                    <template slot="created" scope="row">
                        <span v-if="row.item.created">{{formatDate(row.item.created)}}</span>
                    </template>
                    <template slot="actions" scope="row">
                        <b-button title="Delete user" variant="danger" :disabled="!isAllowed()" @click="remove(row.item)">
                            <i class="fa fa-remove fa-lg"></i>
                        </b-button>
                    </template>
                </b-table>

                <div>
                    <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
                </div>

            </b-card>
        </div>
      <!--/.col-->

    </div>
<!--/.row-->
</template>

<script>
import moment from 'moment'

export default {
  name: 'user_list',
  data() {
    return {
      loading: false,
      pager: null,
      list: [],
      error: null,
      currentPage: 1,
      fields: {
        id: {
          label: 'Id',
          sortable: true,
        },
        username: {
          label: 'Username',
          sortable: true,
        },
        created: {
          label: 'Created',
          sortable: true,
        },
        roles: {
          label: 'Roles'
        },
        status: {
          label: 'Status'
        },
        actions: {}
      },
      perPage: 25,
      totalRows: 0,
      user: null,
      sortBy: "created",
      sortDir: "desc",
      pageOptions: [25,100,250],
      // users of application
      appId: null,
      app: null,
      hasPermission: null,
    }
  },
  mounted() {
    this.user = this.$raptor.Auth().getUser()
    this.appId = this.$route.params.appId
    this.fetchData()
  },
  methods: {
    isAllowed() {
      let allowed = false
      this.user.roles.forEach((e) => {
        if(e.indexOf('admin') > -1) {
          allowed = true
        }
      })
      return allowed
      // if(this.hasPermission != null) {
      //   return this.hasPermission
      // }
      //TODO add local permission checks on sdk
      // if(this.user.id == u.id || this.user.roles.indexOf("admin") > -1) {
      //   this.hasPermission = true
      //   return this.hasPermission
      // }
      // this.hasPermission = false
      // let query = {permission:'delete', type:'user'}
      // if(this.appId) {
      //   query.domain = this.appId
      // }
      // const admin = this.$raptor.Auth().can(query)
      // .then((res) => {
      //   this.hasPermission = res.result
      //   return Promise.resolve(this.hasPermission)
      // })
      // .catch((e) => {
      //   this.hasPermission = false
      //   return Promise.resolve(this.hasPermission)
      // })

      // query = {permission:'delete', type:'user', subjectId:'own'}
      // if(this.appId) {
      //   query.domain = this.appId
      // }
      // const admin_own_user = this.$raptor.Auth().can(query)
      // .then((res) => {
      //   this.hasPermission = res.result
      //   return Promise.resolve(this.hasPermission)
      // })
      // .catch((e) => {
      //   this.hasPermission = false
      //   return Promise.resolve(this.hasPermission)
      // })

      // query = {permission:'delete', subjectId:'own'}
      // if(this.appId) {
      //   query.domain = this.appId
      // }
      // const admin_own = this.$raptor.Auth().can(query)
      // .then((res) => {
      //   this.hasPermission = res.result
      //   return Promise.resolve(this.hasPermission)
      // })
      // .catch((e) => {
      //   this.hasPermission = false
      //   return Promise.resolve(this.hasPermission)
      // })
      // return Promise.all([admin, admin_own, admin_own_user]).then((res) => {
      //   if(res[0] || res[1] || res[2]) {
      //     return true
      //   }
      // })
    },
    formatDate(d) {
      return moment(new Date(d)).format('MMMM Do YYYY')
    },
    fetchData() {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      // page config
      let page = {
        page: this.currentPage,
        size: this.perPage,
        sort: this.sortBy,
        sortDir: this.sortDir,
      }
      // if(this.appId) {
      //   if((this.user.roles.indexOf('admin') > -1) || (this.user.roles.indexOf('admin_user') > -1) || (this.user.roles.indexOf('admin_app') > -1)) {
      //     this.searchUsersForAppId()
      //   }else {
      //     let query = {ownerId: this.user.id}
      //     this.searchUsersForOwnerId(page, query)
      //   }
      //   return
      // }
      if(this.appId && ((this.user.roles.indexOf('admin') > -1) || (this.user.roles.indexOf('admin_user') > -1) || (this.user.roles.indexOf('admin_app') > -1))) {
        this.searchUsersForAppId()
        return
      }
      if(this.user.roles.indexOf('user') > -1) {
        this.searchUsersForOwnerId(page, {ownerId: this.user.id})
        return
      }
      this.$raptor.Admin().User().list(page).then((pager) => {

        this.$log.debug('Loaded %s user list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.list = pager.getContent()
        this.totalRows = pager.getTotalElements()
      }).catch(function(e) {
        context.$log.warn(e)
        if (e.code === 401) {
          context.$raptor.Auth().logout();
          context.$router.push("/pages/login");
        }
      })

    },
    pageChanged(page) {
      this.currentPage = page
      this.fetchData()
    },
    sortingChanged(ev) {
      this.sortBy = ev.sortBy
      this.sortDir = ev.sortDesc ? 'desc' : 'asc'
      this.fetchData()
    },
    itemsLimitChange(limit) {
      this.currentPage = 0
      this.perPage = limit
      this.fetchData()
    },
    remove(user) {
      const userName = user && user.username ? user.username : user
      const userId = user && user.id ? user.id : user
      var context = this
      return this.$dialog.confirm(`Remove user \`${userName}\` ?`, {
          html: false,
          okText: 'Remove',
          cancelText: 'Cancel',
        })
        .then(() => {
          this.$log.debug("Deleting %s", userId)
          let query = {ownerId: this.user.id}
          if(this.app) {
            // query.domain = this.appId
            let userToRemove = this.list.forEach((e) => e.id === userId)
            this.list.splice(this.list.indexOf(userToRemove), 1)
            this.updateApp()
          } else {
            this.$raptor.Admin().User().delete(userId, query)
              .then(() => {
                this.$log.debug("Deleted %s", userId)
                this.fetchData()
              })
          }
        }).catch(function(e) {
          context.$log.error(e)
          context.$log.warn(e)
          if (e.code === 401) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
          }
        })
    },
    searchUsersForAppId() {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      // page config
      this.$raptor.App().read(this.appId)
        .then((app) => {
          this.$log.debug('app %s loaded', app.id)
          this.loading = false
          this.app = app
          this.list = app.users
          this.totalRows = app.users.length
        })
        .catch((e) => {
          ('Failed to load app: %s', e.message)
          this.$log.debug(e)
          this.loading = false
        })
    },
    updateApp() {
      let json = {
        id: this.appId,
        name: this.app.name,
        users: this.list
      }

      this.$raptor.App().save(json)
        .then((app) => {
          this.$log.debug('App %s saved', app.id)
          this.loading = false
          this.searchUsersForAppId()
        })
        .catch((e) => {
          this.$log.error("Error saving app: %s", e.message)
          this.$log.debug(e)
        })
    },
    searchUsersForOwnerId(page, query) {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      this.$raptor.Admin().User().list(query, page).then((pager) => {

        this.$log.debug('Loaded %s user list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.list = pager.getContent()
        this.totalRows = pager.getTotalElements()

      }).catch(function(e) {
        context.$log.warn(e)
        if (e.code === 401) {
          context.$raptor.Auth().logout();
          context.$router.push("/pages/login");
        }
      })
    }
  }

}
</script>
