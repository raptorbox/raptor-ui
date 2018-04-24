<template>
<div class="animated fadeIn row row-fluid">
  <div class="col-lg-12">
    <b-card>

      <div slot="header">

        <div class="row">
          <div class="col-lg-12 list-inline">
            <h3 class="list-inline-item"><i class="fa fa-screen-smartphone"></i> Devices</h3>
            <div v-if="appId">
            <b-button class="list-inline-item" title="Add device" variant="primary" :to="{ name: 'DeviceCreateInApp', params: { appId: appId }}">
              <i class="fa fa-plus"></i> New
            </b-button>
          </div>
          <div v-else>
            <b-button variant="primary" :to="{ name: 'DeviceCreate'}">
              <i class="fa fa-plus"></i> New
            </b-button>
          </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-12 text-left">
            <b-form-fieldset description="Enter Device id to filter" label="Search">
              <v-autocomplete :items="list" v-model="itemAutoComplete" :get-label="getLabel" :component-item='itemAutoTemplate' @update-items="updateItems" :input-attrs="{id: 'v-my-autocomplete'}" @item-clicked="itemClicked" @change="inputChangeEvent" :auto-select-one-item="false"></v-autocomplete>
            </b-form-fieldset>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-9"> </div>
          <div class="col-lg-3 text-right">
            <b-form-fieldset description="Items per page" label="Show" horizontal>
              <b-form-select :options="pageOptions" v-model="perPage"  @change="itemsLimitChange" />
            </b-form-fieldset>
          </div>
        </div>
      </div>

      <br />

      <!-- striped hover -->
      <b-table no-local-sorting small responsive show-empty :items="list" :fields="fields" @sort-changed="sortingChanged">
        <template slot="id" scope="row">
            <b-badge size="sm" variant="light" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.id}}</b-badge>
        </template>
        <template slot="name" scope="row">
            <b-button variant="link" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.name}}</b-button>
        </template>
        <template slot="description" scope="row">{{row.item.description}}</template>
        <template slot="created" scope="row">{{formatDate(row.item.createdAt)}}</template>
        <template slot="actions" scope="row">
              <b-button title="Remove device and stored data" variant="outline-danger" @click="remove(row.item)">
                  <i class="fa fa-remove fa-lg"></i>
              </b-button>
              <b-button title="Edit device definition" variant="outline-primary" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">
                  <i class="fa fa-edit fa-lg"></i>
              </b-button>
              <!-- <b-button title="Edit data streams definitions" variant="outline-primary" :to="{ name: 'Streams', params: { deviceId: row.item.id }}">
                  <i class="fa fa-table fa-lg"></i>
              </b-button> -->
              <b-button title="View stored records" variant="outline-primary" :to="{ name: 'RecordSet', params: { deviceId: row.item.id }}">
                  <i class="fa fa-database fa-lg"></i>
              </b-button>
              <b-button title="Clone this device definition" variant="outline-primary" :to="{ name: 'Clone', params: { deviceId: row.item.id }}">
                  <i class="fa fa-clone fa-lg"></i>
              </b-button>
              <b-button title="Send message to device" variant="outline-primary" :to="{ name: 'SendDeviceActionMessage', params: { deviceId: row.item.id }}">
                <i class="fa fa-paper-plane fa-lg"></i>
              </b-button>
          </template>
      </b-table>

      <div>
        <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
      </div>

    </b-card>
  </div>
</div>
</template>

<script>
import moment from 'moment'

// auto-complete
import Vue from 'vue'
import Autocomplete from 'v-autocomplete'
import 'v-autocomplete/dist/v-autocomplete.css'
Vue.use(Autocomplete)
// item template
import ItemTemplate from './../components/ItemTemplate.vue'

export default {
  name: 'user_list',
  components: {
    'v-autocomplete': Autocomplete
  },
  data() {
    return {
      sortBy: "createdAt",
      sortDir: "desc",
      loading: false,
      pager: null,
      list: [],
      devices: [],
      error: null,
      currentPage: 1,
      fields: [{
          key: 'id',
          label: 'Id',
          sortable: true
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'description',
          label: 'Description'
        },
        {
          key: 'created',
          label: 'Created',
          sortable: true
        },
        {
          key: 'actions',
          label: 'Actions'
        }
      ],
      perPage: 25,
      totalRows: 0,
      pageOptions: [{
        text: 25,
        value: 25
      }, {
        text: 100,
        value: 100
      }, {
        text: 250,
        value: 250
      }],
      // auto-complete item template
      itemAutoTemplate: ItemTemplate,
      itemAutoComplete: null,
      // devices of application
      appId: null,
      app: null,
    }
  },
  mounted() {
    this.appId = this.$route.params.appId
    if(this.appId) {
      this.serachDataForAppId()
    } else {
      this.fetchData(null)
    }
  },
  methods: {
    formatDate(d) {
      return moment(new Date(d)).format('MMMM Do YYYY')
    },
    fetchData(query=null) {
      this.error = null
      this.loading = true
      this.$log.debug('Fetching device list page=%s, size=%s sort=%s.%s', this.currentPage, this.perPage, this.sortBy, this.sortDir)
      //TODO add sort
      let queryParam = {
          page: this.currentPage-1,
          size: this.perPage,
          sort: this.sortBy,
          sortDir: this.sortDir,
        }
      // console.log(queryParam)
        this.$raptor.Inventory().list(query, queryParam)
            .then((pager) => {

                // const list = pager.getContent()
                this.$log.debug('Loaded %s device list', pager.getContent().length)
                // console.log(list.length)

                this.loading = false
                this.pager = pager
                this.totalRows = pager.getTotalElements()
                this.devices = pager.getContent()
                this.list = this.devices
            })
            .catch((e) => {

                this.$log.warn('Failed to load device list: %s', e.message)
                this.$log.debug(e)

                this.error = e.message
                this.list = []
                this.pager = null
                this.loading = false
                if (e.code === 401) {
                    context.$raptor.Auth().logout();
                    context.$router.push("/pages/login");
                }
            })
    },
    pageChanged: function(page) {
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
    remove(device) {
      const deviceId = device && device.id ? device.id : device
      const deviceName = device && device.name ? device.name : device
      var context = this
      this.$dialog.confirm(`Remove device \`${deviceName}\` ?`, {
          html: false,
          okText: 'Remove',
          cancelText: 'Cancel',
        })
        .then(function() {
          // This will be triggered when user clicks on proceed
          context.$log.debug("Deleting %s", deviceId)
          context.$raptor.Inventory().delete({
              id: deviceId
            })
            .then(() => {
              context.$log.debug("Deleted %s", deviceId)
              context.fetchData()
            })
            .catch((e) => {
                context.$log.error("Error deleting %s", e)
                if (e.code === 401) {
                    context.$raptor.Auth().logout();
                    context.$router.push("/pages/login");
                }
            })
        })
    },
    // auto-complete methods
    itemClicked(item) {
      console.log('You clicked an item!', item)
      this.list = []
      for (var i = 0; i < this.devices.length; i++) {
        if (this.devices[i].id == item.id) {
          this.list.push(this.devices[i])
        }
      }
    },
    inputChangeEvent(text) {
      if (text == '') {
        this.fetchData()
      }
    },
    getLabel(item) {
      return item.name + " - " + item.id
    },
    updateItems(text) {
      console.log(text)
      if(text.length >= 3) {
        this.fetchData({name: text, id: text})
        // this.list = []
        // for (var i = 0; i < this.devices.length; i++) {
        //   if (this.devices[i].id.indexOf(text.toLowerCase()) !== -1 || this.devices[i].name.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
        //     this.list.push(this.devices[i])
        //   }
        // }
      }
    },
    searchData(query=null) {
      this.error = null
      this.loading = true
      let queryParam = {
          page: this.currentPage-1,
          size: this.perPage,
          sort: this.sortBy,
          sortDir: this.sortDir,
        }
      this.$raptor.Inventory().search(query, queryParam)
          .then((pager) => {

              // const list = pager.getContent()
              this.$log.debug('Loaded %s device list', pager.getContent().length)
              // console.log(list.length)

              this.loading = false
              this.pager = pager
              this.totalRows = pager.getTotalElements()
              this.devices = pager.getContent()
              this.list = this.devices
          })
          .catch((e) => {

              this.$log.warn('Failed to load device list: %s', e.message)
              this.$log.debug(e)

              this.error = e.message
              this.list = []
              this.pager = null
              this.loading = false
              if (e.code === 401) {
                  context.$raptor.Auth().logout();
                  context.$router.push("/pages/login");
              }
          })
    },
    // for application management
    serachDataForAppId() {
      var context = this
      this.error = null
      this.loading = true
      console.log('Fetching device list page=%s, size=%s sort=%s.%s', this.currentPage, this.perPage, this.sortBy, this.sortDir)
      this.$log.debug('Fetching device list')
      let pageConf = {
        page: this.currentPage-1,
        size: this.perPage,
        sort: this.sortBy,
        sortDir: this.sortDir,
      }
      this.$raptor.Inventory().search({domain: this.appId}, pageConf)
      .then((pager) => {
        this.$log.debug('Loaded %s device list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.totalRows = pager.getTotalElements()
        this.devices = pager.getContent()
        this.list = this.devices
      })
      .catch((e) => {

        this.$log.warn('Failed to load device list: %s', e.message)
        this.$log.debug(e)

        this.error = e.message
        this.list = []
        this.pager = null
        this.loading = false
        if (e.code === 401) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
        }
      })
    },
  }
}
</script>

<style type="text/css">
.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
  font-size: 1em;
  padding: 5px;
  box-shadow: none;
  border: 1px solid #157977;
  width: calc(100% - 32px);
  outline: none;
  background-color: #fff;
}

.v-autocomplete .v-autocomplete-input-group.v-autocomplete-selected .v-autocomplete-input {
  color: #008000;
  background-color: #f2fff2;
}

.v-autocomplete .v-autocomplete-list {
  width: calc(100% - 32px);
  text-align: left;
  border: none;
  border-top: none;
  max-height: 400px;
  overflow-y: auto;
  border-bottom: 1px solid #157977;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item {
  cursor: pointer;
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #157977;
  border-left: 1px solid #157977;
  border-right: 1px solid #157977;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:last-child {
  border-bottom: none;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:hover {
  background-color: #eee;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item abbr {
  opacity: 0.8;
  font-size: 0.8em;
  display: block;
  font-family: sans-serif;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item pre {
  text-align: left;
  white-space: pre-wrap;
  background-color: #eee;
  border: 1px solid #c0c0c0;
  padding: 20px !important;
  border-radius: 10px;
  font-family: monospace !important;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item .left {
  text-align: left;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item .note {
  border-left: 5px solid #ccc;
  padding: 10px;
}
</style>
