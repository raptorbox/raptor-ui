<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <b-card>
        <div class="clearfix" style="background-color: #f0f3f5; border-bottom: 1px solid #c2cfd6; padding:5px;">
          <div>
            <div style="float: left;">
              <p style="text-align: center; font-weight:bold; margin:0;">Devices</p>
            </div>
            <div class="col-md-2 col-md-offset-2" style="float: right;">
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

        <b-table striped hover show-empty :items="list" :fields="fields" :current-page="currentPage" :per-page="perPage" >
          <template slot="name" scope="row">
            <b-button class="btn btn-link" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">{{row.item.name}}</b-button>
          </template>
          <template slot="description" scope="row">{{row.item.description}}</template>
          <template slot="created" scope="row">{{formatDate(row.item.createdAt * 1000)}}</template>
          <template slot="updated" scope="row">{{formatDate(row.item.updatedAt * 1000)}}</template>
          <template slot="actions" scope="row">
            <div class="row">
              <b-button class="btn btn-sm" :to="{ name: 'DeviceUpdate', params: { deviceId: row.item.id }}">Streams</b-button>
              <click-confirm>
                <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item.id)">Delete</b-button>
              </click-confirm>
            </div>
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

  export default {
    name: 'user_list',
    data () {
      return {
        loading: false,
        list: null,
        error: null,
        currentPage: 1,
        fields: {
          name:           { label: 'Name' },
          description:    { label: 'Description' },
          created:        { label: 'Created at' },
          updated:        { label: 'Updated at'},
          actions:        { }
        },
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}]
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
        this.$log.debug('Fetching device list')
        this.$raptor.Inventory().list()
        .then((list) => {
          this.$log.debug('Loaded %s device list', list.length)
          console.log(list)
          this.loading = false
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
        this.$log.debug("Deleting %s", deviceId)
        this.$raptor.Inventory().delete({ id: deviceId})
        .then(() => {
          this.$log.debug("Deleted %s", deviceId)
          this.fetchData()
        })
        .catch((e) => {
          this.$log.error("Error deleting %s", e)
        })
      },
    }

  }
</script>
