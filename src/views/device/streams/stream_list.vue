<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- <b-card header="<i class='fa fa-align-justify'></i> Users"> -->
      <b-card>
        <div class="clearfix" style="background-color: #f0f3f5; border-bottom: 1px solid #c2cfd6; padding:5px;">
          <!-- <div style="float: left;">
            <p style="text-align: center; font-weight:bold; margin:0;">Users</p>
          </div>
          <div style="float: right;">
            <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create User</b-button>
            <b-form-fieldset horizontal :label-cols="1">
              <b-form-select :options="pageOptions" v-model="perPage" />
            </b-form-fieldset>
          </div> -->
          <div>
            <div style="float: left;">
            <p style="text-align: center; font-weight:bold; margin:0;">Users</p>
            </div>
            <div class="col-md-2 col-md-offset-2" style="float: right;">
              <div class="row" style="margin-left:auto; margin-right:0;">
                <div class="col-md-6">
                  <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create User</b-button>
                </div>
                <div class="col-md-6">
                  <b-form-fieldset horizontal>
                    <b-form-select :options="pageOptions" v-model="perPage" />
                  </b-form-fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <table class="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Registered</th>
              <th>Roles</th>
              <th>Status</th>
              <th></th>
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
            <td>
              <click-confirm>
                <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.uuid)">Delete</b-button>
              </click-confirm>
            </td>
          </tr>

        </tbody>
      </table> -->

      <b-table striped hover show-empty :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" >
        <template slot="username" scope="row">
          <b-button class="btn btn-link" :to="{ name: 'UsersUpdate', params: { userId: row.item.uuid }}">
            {{row.item.username}}
          </b-button>
        </template>
        <template slot="registered" scope="row">{{formatDate(row.item.created)}}</template>
        <template slot="roles" scope="row">{{row.item.roles ? row.item.roles.join(', ') : ''}}</template>
        <template slot="status" scope="row">
          <span v-bind:class="['badge', { 'badge-success': row.item.enabled,'badge-warning': !row.item.enabled }]"> {{row.item.enabled ? 'Enabled' : 'Disabled'}}</span>
        </template>
        <template slot="actions" scope="row">
          <click-confirm>
            <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item.uuid)">Delete</b-button>
          </click-confirm>
        </template>
      </b-table>

      <!-- <ul class="pagination">

        <li class="page-item"><a class="page-link" href="#">Prev</a></li>

        <li class="page-item active">
          <a class="page-link" href="#">1</a>
        </li>

        <li class="page-item"><a class="page-link" href="#">2</a></li>

        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul> -->
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
    name: 'user_list',
    data () {
      return {
        loading: false,
        list: null,
        error: null,
        currentPage: 1,
        fields: {
          username:     { label: 'Username' },
          registered:   { label: 'Registered' },
          roles:        { label: 'Roles' },
          status:       { label: 'Status'},
          actions:      { }
        },
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}]
      }
    },
    mounted () {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
      }
      // this.fetchData()
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY')
      },
      load(deviceId) {
        this.loading = true
        this.$raptor.Inventory().read(deviceId)
        .then((device) => {
          this.$log.debug('device %s loaded', device)
          this.loading = false
          this.$data.name = device.name
          this.$data.description = device.description
          this.$data.id = device.id
          this.$data.userId = device.it
          Object.assign(this.$data, device)
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
      },
    }

  }
</script>