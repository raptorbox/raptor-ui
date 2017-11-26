<template>
<div class="animated fadeIn row row-fluid">
  <div class="col-lg-12">
    <b-card>
      <div class="row-fluid">

        <div class="row">
          <div class="col-lg-12 text-right">
            <b-button variant="primary" :to="{ name: 'DeviceCreate'}">
              <i class="fa fa-plus"></i> Add Device
            </b-button>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-12 text-left">
            <!-- <p style="text-align: center; font-weight:bold; margin:0;">Devices</p> -->
            <b-form-fieldset description="Enter Device id to filter" label="Search">
              <!-- <b-form-input type="text" placeholder="Enter UserId" v-model="userId"></b-form-input> -->
              <v-autocomplete :items="list" v-model="itemAutoComplete" :get-label="getLabel" :component-item='itemAutoTemplate' @update-items="updateItems" :input-attrs="{id: 'v-my-autocomplete'}" @item-clicked="itemClicked" @change="inputChangeEvent"></v-autocomplete>
            </b-form-fieldset>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-9"> </div>
          <div class="col-lg-3 text-right">
            <b-form-fieldset description="Items per page" label="Show" :horizontal=true>
              <b-form-select :options="pageOptions" v-model="perPage" />
            </b-form-fieldset>
          </div>
        </div>
      </div>

      <br />

      <!-- v-autocomplete(:items="items" v-model='item', :get-label='getLabel', :min-len='0' @update-items='update', :component-item='tpl', @item-selected="itemSelected", @item-clicked="itemClicked", :input-attrs="{name: 'input-test', id: 'v-my-autocomplete'}")
  p Selected item:
  pre {{ item }} -->

      <!-- striped hover -->
      <b-table no-local-sorting small responsive show-empty :items="list" :fields="fields" @sort-changed="sortingChanged" :per-page="0">
        <template slot="id" scope="row">
            <b-badge size="sm" variant="light" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.id}}</b-badge>
          </template>
        <template slot="name" scope="row">
            <b-button variant="link" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.name}}</b-button>
          </template>
        <template slot="description" scope="row">{{row.item.description}}</template>
        <template slot="created" scope="row">{{formatDate(row.item.json.createdAt * 1000)}}</template>
        <!-- <template slot="updated" scope="row">{{formatDate(row.item.json.updatedAt * 1000)}}</template> -->
        <template slot="actions" scope="row">
              <b-button title="Remove device and stored data" variant="outline-danger" @click="remove(row.item)">
                  <i class="fa fa-remove fa-lg"></i>
              </b-button>
              <b-button title="Edit device definition" variant="outline-primary" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">
                  <i class="fa fa-edit fa-lg"></i>
              </b-button>
              <b-button title="Edit data streams definitions" variant="outline-primary" :to="{ name: 'Streams', params: { deviceId: row.item.id }}">
                  <i class="fa fa-table fa-lg"></i>
              </b-button>
              <b-button title="View stored records" variant="outline-primary" :to="{ name: 'RecordSet', params: { deviceId: row.item.id }}">
                  <i class="fa fa-database fa-lg"></i>
              </b-button>
              <b-button title="Clone this device definition" variant="outline-primary" :to="{ name: 'Clone', params: { deviceId: row.item.id }}">
                  <i class="fa fa-clone fa-lg"></i>
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
      sortBy: "created",
      sortDir: "asc",
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
        //   { key:'updated',        label: 'Updated'   },
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
    }
  },
  mounted() {
    // this.remove("36a1e930-83de-4b97-a967-0f5ed649d532")
    this.fetchData()
  },
  methods: {
    formatDate(d) {
      return moment(new Date(d)).format('MMMM Do YYYY')
    },
    fetchData() {
      this.error = null
      this.loading = true
      this.$log.debug('Fetching device list page=%s, size=%s sort=%s.%s', this.currentPage, this.perPage, this.sortBy, this.sortDir)
      //TODO add sort
      this.loading = true
      this.$raptor.Inventory().list(this.currentPage - 1, this.perPage, this.sortBy, this.sortDir)
        .then((pager) => {

          const list = pager.getContent()
          this.$log.debug('Loaded %s device list', list.length)

          this.loading = false
          this.pager = pager
          this.totalRows = pager.getTotal()
          this.devices = list
          this.list = list

        })
        .catch((e) => {
          this.$log.debug('Failed to load device list')
          this.$log.error(e)

          this.error = e.message
          this.list = []
          this.pager = null
          this.loading = false
        })
    },
    pageChanged: function(page) {
      this.currentPage = page
      this.fetchData()
    },
    sortingChanged(ev) {
      console.warn(ev, ev.sortBy, ev.sortDesc);
      this.sortBy = ev.sortBy
      this.sortDir = ev.sortDesc ? 'desc' : 'asc'
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
          console.log('canceled operation')
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
            })
        })
        .catch(function() {
          // This will be triggered when user clicks on cancel
          console.log('canceled operation')
        });
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
        this.list = this.devices
      }
    },
    getLabel(item) {
      return item.name + " - " + item.id
    },
    updateItems(text) {
      console.log(text)
      this.list = []
      for (var i = 0; i < this.devices.length; i++) {
        if (this.devices[i].id.indexOf(text) !== -1 || this.devices[i].name.indexOf(text) !== -1) {
          this.list.push(this.devices[i])
        }
      }
    }
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
