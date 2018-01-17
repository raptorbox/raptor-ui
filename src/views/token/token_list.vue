<template>
  <div>
    <div class="animated fadeIn row row-fluid">
      <div class="col-lg-12">
        <b-card>
          <div slot="header">
            <div class="row row-fluid">
              <div class="col-lg-8 list-inline">
                <div class="col-md-3">
                  <h3 class="list-inline-item">Tokens</h3>
                </div>
                <b-button class="list-inline-item" variant="primary" :to="{ name: 'TokensCreate'}">
                  <i class="fa fa-plus"></i> New
                </b-button>
              </div>
              <!-- <div style="float: left;">
                <p style="text-align: center; font-weight:bold; margin:0;">Tokens</p>
              </div>
              <div class="col-md-2 col-md-offset-2" style="float: right;">
                <div class="row" style="margin-left:auto; margin-right:0;">
                  <div class="col-md-6">
                    <b-button class="btn btn-primary" :to="{ name: 'TokensCreate'}">Create Token</b-button>
                  </div> -->
              <div class="col-md-4 text-right">
                <b-form-fieldset description="Items per page" label="Show" horizontal>
                  <!-- <b-form-select :options="pageOptions" v-model="perPage" /> -->
                  <b-form-select :options="pageOptions" v-model="perPage" @change="itemsLimitChange"/>
                </b-form-fieldset>
              </div>
            </div>
          </div>  

          <!-- <b-table small responsive show-empty :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" > -->
          <b-table no-local-sorting small responsive show-empty :items="list" :fields="fields" @sort-changed="sortingChanged">
            <template slot="name" scope="row">
              <b-button class="btn btn-link" :to="{ name: 'TokensUpdate', params: { tokenId: row.item.id }}">
                {{row.item.name}}
              </b-button>
            </template>
            <template slot="expires" scope="row">{{formatDate(row.item.expires)}}</template>
            <template slot="token" scope="row">
              <b-button class="btn btn-sm" @click="openModalWin(row.item)">Show Token</b-button>
            </template>
            <!-- <template slot="secret" scope="row">{{row.item.secret}}</template> -->
            <!-- <template slot="device" scope="row">{{row.item.deviceId}}</template> -->
            <template slot="owner" scope="row">{{row.item.userId}}</template>
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
              <span v-bind:class="['badge', { 'badge-success': row.item.expires > (new Date()),'badge-warning': !row.item.valid }]"> {{row.item.expires > (new Date()) ? 'Valid' : 'Expired'}}</span>
            </template>
            <template slot="actions" scope="row">
              <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item)">Delete</b-button>
            </template>
          </b-table>

          <div>
            <!-- <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" /> -->
            <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
          </div>
        </b-card>

      </div>
      <!--/.col-->
      <!-- show token -->
    </div>
    <!--/.row-->

    <b-modal title="Selected Token" size="lg" class="modal-info" v-model="showToken">
      <b-form-fieldset label="Token" :horizontal="false">
        <b-form-input type="text" placeholder="Token" v-model="modalWin.token" disabled></b-form-input>
      </b-form-fieldset>
    </b-modal>
  </div>
</template>

<script>
  import moment from 'moment'

  export default {
    name: 'token_list',
    data () {
      return {
        loading: false,
        list: [],
        pager: null,
        error: null,
        currentPage: 1,
        fields: {
          name:         { label: 'Name', sortable: true },
          expires:      { label: 'Expire On', sortable: true },
          token:        { label: 'token' },
          // secret:       { label: 'Secret' },
          // device:       { label: 'Device Id' },
          owner:        { label: 'Owner' },
          permission:   { label: 'Permissions' },
          status:       { label: 'Status', sortable: true},
          valid:        { label: 'Is Valid', sortable: true,},
          actions:      { }
        },
        totalRows: 0,
        listWithPermissions: {},
        perPage: 25,
        sortBy: "expires",
        sortDir: "desc",
        pageOptions: [25,100,250],
        currentDateTime: null,
        showToken: false,
        modalWin: {},
      }
    },
    mounted () {
      this.currentDateTime = new Date()
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
        // page config
        let page = {
          page: this.currentPage,
          size: this.perPage,
          sort: this.sortBy,
          sortDir: this.sortDir,
        }
        this.$raptor.Admin().Token().list(null, page)
        .then((pager) => {
          this.$log.debug('Loaded %s tokens', pager.getContent().length)
          // console.log(pager)

          this.loading = false
          this.pager = pager
          this.list = pager.getContent()
          this.totalRows = pager.getTotalElements()

          for (var i = 0; i < this.list.length; i++) {
            this.listWithPermissions[this.list[i].id] = []
          }
          // console.log(this.listWithPermissions)
        })
        .catch((e) => {
          this.$log.debug('Failed to load list')
          this.$log.error(e)
          this.error = e.message
          this.list = []
          this.loading = false
          this.$log.warn(e)
          if (e.code === 401) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      },
      loadPermissions (tok) {
        this.$raptor.Admin().Token().Permission().get(tok)
        .then((permission) => {
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
          this.loading = false
          if (e.code === 401) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
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
        this.currentPage = 1
        this.perPage = limit
        this.fetchData()
      },
      remove (token) {
        return this.$dialog.confirm(`Remove token \`${token.name}\` ?`, {
          html: false,
          okText: 'Remove',
          cancelText: 'Cancel',
        })
        .then(() => {
          this.$log.debug("Deleting %s", token.id)
          this.$raptor.Admin().Token().delete({ id: token.id})
          .then(() => {
            this.$log.debug("Deleted %s", token.id)
            this.fetchData()
          })
          .catch((e) => {
            this.$log.error(e)
            this.$log.error("Error deleting %s", token.id)
            if (e.code === 401) {
              this.$raptor.Auth().logout();
              this.$router.push("/pages/login");
            }
          })
        })
        .catch(function () {
          console.log('Clicked on cancel')
        });
      },
      openModalWin(token) {
        this.modalWin = token
        this.showToken = true
      },
    }

  }
</script>
