<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- <b-card header="<i class='fa fa-align-justify'></i> Users"> -->
      <b-card>
      <!-- <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Registered</th>
            <th>Roles</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="row,idx in list">
            <td>
              <b-button class="btn btn-link" :to="{ name: 'UsersUpdate', params: { userId: row.uuid }}">
                  {{row.username}}
              </b-button>
            </td>

            <td>{{formatDate(row.created)}}</td>
            <td>{{row.roles.join(", ")}}</td>
            <td>
              <span v-bind:class="['badge', {
                      'badge-success': row.enabled,
                      'badge-warning': !row.enabled
                  }]">{{row.enabled ? 'Enabled' : 'Disabled'}}</span>
            </td>
          </tr>

        </tbody>
      </table>
      <ul class="pagination">

        <li class="page-item"><a class="page-link" href="#">Prev</a></li>

        <li class="page-item active">
          <a class="page-link" href="#">1</a>
        </li>

        <li class="page-item"><a class="page-link" href="#">2</a></li>

        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul> -->

      <!-- 
      <div style="float: right;">
        <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create Token</b-button>
        <b-form-fieldset horizontal :label-cols="1">
          <b-form-select :options="pageOptions" v-model="perPage" />
        </b-form-fieldset>
      </div> -->

      <div>
        <div style="float: left;">
          <p style="text-align: center; font-weight:bold; margin:0;">Tokens</p>
        </div>
        <div class="col-md-2 col-md-offset-2" style="float: right;">
          <div class="row" style="margin-left:auto; margin-right:0;">
            <div class="col-md-6">
              <b-button class="btn btn-primary" :to="{ name: 'TokensCreate'}">Create Token</b-button>
            </div>
            <div class="col-md-6">
              <b-form-fieldset horizontal>
                <b-form-select :options="pageOptions" v-model="perPage" />
              </b-form-fieldset>
            </div>
          </div>
        </div>
      </div>  

      <b-table small responsive show-empty :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" >
        <template slot="name" scope="row">
          <b-button class="btn btn-link" :to="{ name: 'TokensUpdate', params: { tokenId: row.item.id }}">
            {{row.item.name}}
          </b-button>
        </template>
        <template slot="registered" scope="row">{{formatDate(row.item.created)}}</template>
        <!-- <template slot="token" scope="row">{{row.item.token}}</template> -->
        <!-- <template slot="secret" scope="row">{{row.item.secret}}</template> -->
        <!-- <template slot="device" scope="row">{{row.item.deviceId}}</template> -->
        <template slot="owner" scope="row">{{row.item.owner.username}}</template>
        <template slot="status" scope="row">
          <span v-bind:class="['badge', { 'badge-success': row.item.enabled,'badge-warning': !row.item.enabled }]"> {{row.item.enabled ? 'Enabled' : 'Disabled'}}</span>
        </template>
        <template slot="permission" scope="row">
          <div @click="loadPermissions(row.item)">
            <span v-if="listWithPermissions[row.item.id] && listWithPermissions[row.item.id].length > 0"><p><span v-bind:id="row.item.id" v-for="p in listWithPermissions[row.item.id]">{{p}}, </span></p></span>
            <span v-else>
              <b-button class="btn btn-sm">Show Permissions</b-button>
            </span>
          </div>
        </template>
        <template slot="valid" scope="row">
          <span v-bind:class="['badge', { 'badge-success': row.item.valid,'badge-warning': !row.item.valid }]"> {{row.item.valid ? 'Valid' : 'Not Valid'}}</span>
        </template>
        <template slot="actions" scope="row">
          <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item.id)">Delete</b-button>
        </template>
      </b-table>

      <div>
        <b-pagination :total-rows="list.length" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
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
    name: 'token_list',
    data () {
      return {
        loading: false,
        list: [],
        error: null,
        currentPage: 1,
        fields: {
          name:         { label: 'Name' },
          registered:   { label: 'Registered' },
          // token:        { label: 'token' },
          // secret:       { label: 'Secret' },
          // device:       { label: 'Device Id' },
          owner:        { label: 'Owner' },
          permission:   { label: 'Permissions' },
          status:       { label: 'Status'},
          valid:        { label: 'Is Valid'},
          actions:      { }
        },
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}],
        listWithPermissions: {}
      }
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY')
      },
      fetchData () {
        this.error = null
        this.loading = true
        this.$log.debug('Fetching list')
        this.$raptor.Admin().Token().list()
        .then((list) => {
          this.$log.debug('Loaded %s tokens', list.length)
          console.log(list)
          this.loading = false
          this.list = list
          this.totalRows = list.length
          for (var i = 0; i < list.length; i++) {
            this.listWithPermissions[list[i].id] = []
          }
          console.log(this.listWithPermissions)
        })
        .catch((e) => {
          this.$log.debug('Failed to load list')
          this.$log.error(e)
          console.log(e)
          this.error = e.message
          this.list = []
          this.loading = false
        })
      },
      loadPermissions (tok) {
        this.$raptor.Admin().Token().Permission().get(tok)
        .then((permission) => {
          console.log(JSON.stringify(permission))
          if(permission) {
            let backup = this.listWithPermissions
            for (var i = 0; i < this.list.length; i++) {
              if(this.list[i].id == tok.id) {
                backup[this.list[i].id] = permission
              }
            }
            this.listWithPermissions = {}
            this.listWithPermissions = backup
          }
          this.permissions = ['admin','list','read','update','create','delete','push','pull','execute','data','tree']
        })
        .catch((e) => {
          this.$log.debug('Failed to load permission')
          this.$log.error(e)
          console.log(e)
          this.loading = false
        })
      },
      remove (tokenId) {
        this.$dialog.confirm('Are you sure, you want to remove this token?')
        .then(function () {
          this.$log.debug("Deleting %s", tokenId)
          this.$raptor.Admin().Token().delete({ id: tokenId})
          .then(() => {
            this.$log.debug("Deleted %s", tokenId)
            this.fetchData()
          })
          .catch((e) => {
            console.log(e)
            this.$log.error("Error deleting %s", tokenId)
          })
        })
        .catch(function () {
          console.log('Clicked on cancel')
        });
      },
    }

  }
</script>
