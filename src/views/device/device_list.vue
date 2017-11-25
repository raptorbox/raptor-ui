<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <b-card>
        <div class="clearfix" style="background-color: #f0f3f5; border-bottom: 1px solid #c2cfd6; padding:5px;">
          <div class="row">
            <div class="col-md-8">
              <div class="text-left">
                <!-- <p style="text-align: center; font-weight:bold; margin:0;">Devices</p> -->
                <b-form-fieldset description="Enter Device id to filter" label="Devices" :horizontal="false">
                  <!-- <b-form-input type="text" placeholder="Enter UserId" v-model="userId"></b-form-input> -->
                  <v-autocomplete :items="list" v-model="itemAutoComplete" :get-label="getLabel" :component-item='itemAutoTemplate' @update-items="updateItems" :input-attrs="{id: 'v-my-autocomplete'}" @item-clicked="itemClicked" @change="inputChangeEvent">
                  </v-autocomplete>
                </b-form-fieldset>
              </div>
            </div>
            <div class="col-md-4 col-md-offset-2" style="float: right;">
              <div class="row" style="margin-left:auto; margin-right:0;">
                <div class="col-md-6">
                  <b-button class="btn btn-primary" :to="{ name: 'DeviceCreate'}">Create Device</b-button>
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
        <!-- v-autocomplete(:items="items" v-model='item', :get-label='getLabel', :min-len='0' @update-items='update', :component-item='tpl', @item-selected="itemSelected", @item-clicked="itemClicked", :input-attrs="{name: 'input-test', id: 'v-my-autocomplete'}")
  p Selected item:
  pre {{ item }} -->
        <!-- striped hover -->
        <b-table small responsive show-empty :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" >
          <template slot="name" scope="row">
            <b-button class="btn btn-link" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.name}}</b-button>
          </template>
          <template slot="description" scope="row">{{row.item.description}}</template>
          <template slot="created" scope="row">{{formatDate(row.item.json.createdAt * 1000)}}</template>
          <template slot="updated" scope="row">{{formatDate(row.item.json.updatedAt * 1000)}}</template>
          <template slot="actions" scope="row">
            <!-- <div class="row"> -->
              <b-button class="btn btn-sm" :to="{ name: 'Streams', params: { deviceId: row.item.id }}">Streams</b-button>
              <b-button class="btn btn-primary btn-sm" :to="{ name: 'RecordSet', params: { deviceId: row.item.id }}">Records</b-button>
              <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item.id)">Delete</b-button>
              <b-button class="btn btn-outline-info btn-sm" :to="{ name: 'Clone', params: { deviceId: row.item.id }}">Clone</b-button>
            <!-- </div> -->
          </template>
        </b-table>

        <div>
          <b-pagination :total-rows="list.length" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
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
    data () {
      return {
        loading: false,
        list: [],
        devices: [],
        error: null,
        currentPage: 1,
        fields: [
          { key:'name',           label: 'Name'         },
          { key:'description',    label: 'Description'  },
          { key:'created',        label: 'Created'   },
          { key:'updated',        label: 'Updated'   },
          { key:'actions',        label: 'Actions'   }
        ],
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}],
        // auto-complete item template
        itemAutoTemplate: ItemTemplate,
        itemAutoComplete: null,
      }
    },
    mounted () {
      // this.remove("36a1e930-83de-4b97-a967-0f5ed649d532")
      // this.remove("70c3ab16-1303-4f05-9ba2-2ecfaca5b918")
      // this.remove("603d2474-aeb4-4b26-9417-e939cc6f55bb")
      // this.remove("5f38f2e8-ae08-4f0d-bc58-ded23dfb1b18")
      // this.remove("cb6bc1ef-b4aa-4f0f-a24d-a9d97a44506a")
      // this.remove("477158e2-b544-4622-9dab-caddcefd69b0")
      this.fetchData()
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY')
      },
      fetchData () {
        this.error = null
        this.loading = true
        this.$log.debug('Fetching device list')
        this.$raptor.Inventory().list()
        .then((pager) => {
          const list = pager.getContent()
          this.$log.debug('Loaded %s device list', list.length)
          console.log(list)
          // console.log(JSON.stringify(list))
          this.loading = false
          this.devices = list
          this.list = list
          this.totalRows = list.length
        })
        .catch((e) => {
          this.$log.debug('Failed to load device list')
          this.$log.error(e)

          this.error = e.message
          this.list = []
          this.loading = false
        })
      },
      remove (deviceId) {
        var context = this
        this.$dialog.confirm('Are you sure, you want to remove this device?')
        .then(function () {
            // This will be triggered when user clicks on proceed
          console.log('canceled operation')
          context.$log.debug("Deleting %s", deviceId)
          context.$raptor.Inventory().delete({ id: deviceId})
          .then(() => {
            context.$log.debug("Deleted %s", deviceId)
            context.fetchData()
          })
          .catch((e) => {
            context.$log.error("Error deleting %s", e)
          })
        })
        .catch(function () {
            // This will be triggered when user clicks on cancel
          console.log('canceled operation')
        });
      },
      // auto-complete methods
      itemClicked (item) {
        console.log('You clicked an item!', item)
        this.list = []
        for (var i = 0; i < this.devices.length; i++) {
          if(this.devices[i].id == item.id) {
            this.list.push(this.devices[i])
          }
        }
      },
      inputChangeEvent(text) {
        if(text == '') {
          this.list = this.devices
        }
      },
      getLabel (item) {
        return item.name + " - " + item.id
      },
      updateItems (text) {
        console.log(text)
        this.list = []
        for (var i = 0; i < this.devices.length; i++) {
          if(this.devices[i].id.indexOf(text) !== -1 || this.devices[i].name.indexOf(text) !== -1) {
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
