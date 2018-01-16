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
            <b-button class="list-inline-item" variant="primary" :to="{ name: 'UsersCreate'}">
              <i class="fa fa-plus"></i> New
            </b-button>
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
          <b-badge size="sm" variant="light" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">{{row.item.id}}</b-badge>
        </template>
        <template slot="username" scope="row" v-if="row.item.username">
          <span v-if="row.item.username">
            <b-button variant="link" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">
            {{row.item.username}}
            </b-button>
          </span>
        </template>
        <!-- <template slot="roles" scope="row">
            <b-badge v-for="role in row.item.roles" :key="role.name" :variant="role.name === 'admin' ? 'info' : 'light'">
                {{ role.name }}
            </b-badge>
        </template> -->
        <template slot="status" scope="row">
            <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
        </template>
        <template slot="created" scope="row">
          <span v-if="row.item.created">{{formatDate(row.item.created)}}</span>
        </template>
        <template slot="actions" scope="row">
          <b-form-select :options="roleOptions" v-model="row.item.selectedRole" @change.native="(ev) => {addUserAs(ev, row.item)}"/>
          <!-- <b-button class="list-inline-item" variant="primary" @click="addUserAs(row.item)">
              <i class="fa fa-plus"></i> Add as User
          </b-button> -->
        </template>
      </b-table>

      <div>
        <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
      </div>

      <b-card-footer>
        <!-- @click="addUsersToApplication" -->
        <div>
          <!-- :to="{ name: 'AppUpdate', params: { usersToAdd: usersToAdd }}" -->
          <b-button class="float-right" variant="primary" @click="addUsersToApplication">Add</b-button>
        </div>
      </b-card-footer>      

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
  props: ['rolesInApplication', 'appUsers'],
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
        // roles: {
        //   label: 'Roles'
        // },
        status: {
          label: 'Status'
        },
        actions: {
          label: 'Add User as'
        },
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
      totalPages: 1,
      usersToAdd: [],
      roleOptions: [],
      selectedRole: null,
    }
  },
  mounted() {
    this.user = this.$raptor.Auth().getUser()
    this.appId = this.$route.params.appId
    this.usersToAdd = this.appUsers
    if(this.rolesInApplication) {
      this.rolesInApplication.forEach((e) => this.roleOptions.push(e.name))
    }
    this.fetchData()
  },
  methods: {
    hasPermission(perm, type, domain, ownershipOf) {
      //TODO add local permission checks on sdk
      // return this.user.id == u.id || this.user.roles.indexOf("admin") > -1
        if(this.appId) {
          let query = {permission:perm, type:type}
          if(domain) {
            query.domain = domain
          }
          if(ownershipOf) {
            query.subjectId = ownershipOf
          }
          return this.$raptor.Auth().can(query)
            .then((res) => {
              // console.log(perm + '    ' + JSON.stringify(res))
              return Promise.resolve(res.result)
            })
            .catch((e) => {
              // console.log(JSON.stringify(e))
              return Promise.resolve(false)
            })
        }
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
      // let usr = this.appUsers.find((e) => e.id == this.user.id)
      // let adminRights = false
      // if((usr.roles.indexOf('admin') > -1) || (usr.roles.indexOf('admin_app') > -1) || (usr.roles.indexOf('admin_own_app') > -1)) {
      //   adminRights = true
      // }
      this.hasPermission('admin', 'user')
      .then((res) => {
        if(res){
          console.log('admin user ' + res)
          this.searchUser(page)
        }
        return res
      }).then((res) => {
        if(!res) {
          return this.hasPermission('admin', 'user', this.appId, this.user.id)
          .then((res) => {
            console.log('admin user with app and userid ' + res)
            if(res){
              this.searchUsersForOwnerId(page)
            }
            return res
          })
        }
        return res
      }).then((res) => {
        console.log(res)
        if(!res) {
          let result = this.hasPermission('admin', 'app', this.appId)
          let result2 = this.hasPermission('admin','app', this.appId, this.user.id)
          return Promise.all([result, result2])
          .then((res) => {
            if(res[0] || res[1]) {
              console.log('admin app with appid ' + res)
              this.searchUserForAppId(page)
            }
            return res
          })
        }
      })
      // if(this.user.roles.indexOf('user') > -1) {
      //   this.searchUsersForOwnerId(page)
      //   return
      // }

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
          this.$raptor.Admin().User().delete(userId)
            .then(() => {
              this.$log.debug("Deleted %s", userId)
              this.fetchData()
            })
        }).catch(function(e) {
          context.$log.error(e)
          context.$log.warn(e)
          if (e.code === 401) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
          }
        })
    },
    toggleSelect(user) {
      if(userId) {
        this.usersToAdd.push(user)
      } else {
        this.$log.debug('UserId not forund')
      }
    },
    addUsersToApplication() {
      if(this.appId) {
        var context = this

        this.loading = true
        let json = {
          id: this.appId,
          users: this.usersToAdd
        }
        this.$raptor.App().save(json)
        .then((app) => {
          this.$log.debug('App %s updated', app.id)
          this.loading = false
          this.$router.push("/admin/applications")
        })
        .catch((e) => {
          this.$log.error("Error saving app: %s", e.message)
          this.$log.debug(e)
        })
      } else {
        alert("Application Id not found")
      }
    },
    addUserAs(evt, user) {
      let role = evt.target.value;
      if(user.id) {
        let found = false
        for (var i = 0; i < this.usersToAdd.length; i++) {
          if (this.usersToAdd[i].id === user.id) {
              // this.usersToAdd[i] = {id: user.id, roles: [role]}
              this.usersToAdd[i].roles.push(role)
              found = true
          }
        }
        if(!found){
          this.usersToAdd.push({id: user.id, roles: [role]})
        }
      } else {
        this.$log.debug('UserId not forund')
      }
    },
    searchUserForAppId(page) {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      let query = {ownerId: this.user.id, domain: this.appId}
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
    },
    searchUsersForOwnerId(page) {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      let query = {ownerId: this.user.id, domain: this.appId}
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
    },
    searchUser(page) {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      this.$raptor.Admin().User().list(page).then((pager) => {

        this.$log.debug('Loaded %s user list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.list = pager.getContent()
        // this.list.forEach((e) => {
        //   let u = this.appUser.find((e) => e.id == e.id)
        //   if(u) {
        //     e.selectedRole = u.role
        //   } else {
        //     e.selectedRole = null
        //   }
        // })
        this.list.forEach((e) => e.selectedRole = null)
        this.totalRows = pager.getTotalElements()
        this.totalPages = pager.getTotalPages()

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
