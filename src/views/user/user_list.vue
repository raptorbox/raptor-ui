<template>
<div class="animated fadeIn row row-fluid">
  <div class="col-lg-12">

    <b-card>

      <div slot="header">

        <div class="row row-fluid">
          <div class="col-lg-8 list-inline">
            <h3 class="list-inline-item"><i class="fa fa-users"></i> Users</h3>
            <b-button class="list-inline-item" variant="primary" :to="{ name: 'UsersCreate'}">
              <i class="fa fa-plus"></i> New
            </b-button>
          </div>
          <div class="col-md-4 text-right">
            <b-form-fieldset description="Items per page" label="Show" horizontal>
              <b-form-select :options="pageOptions" v-model="perPage" />
            </b-form-fieldset>
          </div>
        </div>

      </div>

      <b-table no-local-sorting small responsive show-empty :items="list" :fields="fields" @sort-changed="sortingChanged" :per-page="0">
        <template slot="id" scope="row">
              <b-badge size="sm" variant="light" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">{{row.item.id}}</b-badge>
            </template>
        <template slot="username" scope="row">
          <b-button variant="link" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">
            {{row.item.username}}
          </b-button>
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
            {{formatDate(row.item.created)}}
        </template>
        <template slot="actions" scope="row">
            <b-button title="Delete user" variant="danger" :disabled="!isAllowed('user_delete')" @click="remove(row.item)">
              <i class="fa fa-remove fa-lg"></i>
            </b-button>
        </template>
      </b-table>

      <div>
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
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
      pageOptions: [{
        text: 25,
        value: 25
      }, {
        text: 100,
        value: 100
      }, {
        text: 250,
        value: 250
      }]
    }
  },
  mounted() {
    this.user = this.$raptor.Auth().getUser()
    this.fetchData()
  },
  methods: {
    isAllowed(u) {
      //TODO add local permission checks on sdk
      return this.user.id == u.id || this.user.roles.indexOf("admin") > -1
    },
    formatDate(d) {
      return moment(new Date(d)).format('MMMM Do YYYY')
    },
    fetchData() {
      var context = this
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      this.$raptor.Admin().User().list({
        page: this.currentPage - 1,
        size: this.perPage,
        sort: this.sortBy,
        sortDir: this.sortDir,
      }).then((pager) => {

        this.$log.debug('Loaded %s user list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.list = pager.getContent()
        this.totalRows = pager.getTotalElements()

      }).catch(function(e) {
        this.$log.warn(e)
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
          this.$raptor.Admin().User().delete({
              id: userId
            })
            .then(() => {
              this.$log.debug("Deleted %s", userId)
              this.fetchData()
            })
        }).catch(function(e) {
          this.$log.error(e)
        })
    },
  }

}
</script>
