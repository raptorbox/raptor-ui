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
              <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create Token</b-button>
            </div>
            <div class="col-md-6">
              <b-form-fieldset horizontal>
                <b-form-select :options="pageOptions" v-model="perPage" />
              </b-form-fieldset>
            </div>
          </div>
        </div>
      </div>  

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
        <template slot="token" scope="row">
          {{row.item.username}}
        </template>
      </b-table>

      <div>
        <b-pagination :total-rows="list.count" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
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
        list: null,
        error: null,
        currentPage: 1,
        fields: {
          username:     { label: 'Username' },
          registered:   { label: 'Registered' },
          roles:        { label: 'Roles' },
          status:       { label: 'Status' },
          token:      { label: 'Token' }
        },
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}]
      }
    },
    events: {
      'tableChangeEvent': function(table) {
        this.current_table = table;
        var vm = this;
        this.$nextTick(function() {
          vm.$broadcast('vuetable:refresh');
        });
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

          this.loading = false
          this.list = list
          this.totalRows = list.length
        })
        .catch((e) => {
          this.$log.debug('Failed to load list')
          this.$log.error(e)

          this.error = e.message
          this.list = []
          this.loading = false
        })
      }
    }

  }
</script>
