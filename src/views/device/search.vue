<template>
  <div>
    <b-card>
      <div class="row">
        <div class="col-md-6">
          <b-form-fieldset description="Please enter Firebase user ID" label="User ID" :horizontal="false">
            <b-form-input type="text" placeholder="Enter Firebase User ID" v-model="fuserId"></b-form-input>
          </b-form-fieldset>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <div slot="footer">
            <b-button type="submit" size="sm" variant="primary" class="float-right" @click="save">
              <i class="fa fa-dot-circle-o"></i> Search Devices
            </b-button>
            &nbsp;
            <b-button type="reset" size="sm" variant="danger" class="float-right" @click="cancel">
              <i class="fa fa-ban"></i> Cancel
            </b-button>
          </div>
        </div>
        <!--/.col-->
      </div>
    <!--/.row-->
    </b-card>

    <b-card>
      <b-table striped hover show-empty :items="devices" :fields="fields" :current-page="currentPage" :per-page="perPage" >
        <template slot="name" scope="row">{{row.item.name}}</template>
        <template slot="deviceid" scope="row">{{row.item.id}}</template>
        <template slot="created" scope="row">{{formatDate(row.item.json.createdAt * 1000)}}</template>
        <template slot="userid" scope="row">{{row.item.properties.userId}}</template>
        <template slot="actions" scope="row">
          <div class="row">
            <b-button class="btn btn-sm" :to="{ name: 'RealTimeChart', params: { deviceId: row.item.id }}">Real Time Data</b-button>
          </div>
        </template>
      </b-table>
      <div>
        <b-pagination :total-rows="devices.length" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
      </div>
    </b-card>
  </div>
</template>

<script>
  import moment from 'moment'

//'R6ofHaSOi9Zt2aeE57kOBkU6mim2'
  export default {
    name: 'SearchDevice',
    data() {
      return {
        devices: [],
        fuserId: null,
        fields: {
          name:           { label: 'Name' },
          deviceid:    { label: 'Device ID' },
          created:        { label: 'Created at' },
          userid:        { label: 'User ID'},
          actions:        { }
        },
        currentPage: 1,
        perPage: 10,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}]
      }
    },
    mounted() {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
      }
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY')
      },
      cancel() {
        this.$router.push("/dashboard")
      },
      save() {
        if(this.fuserId) {
          this.$raptor.Inventory().search({properties: {userId: this.fuserId}})
          .then((devices) => {
            this.$log.debug(devices)
            console.log(devices)
            this.devices = devices
          })
          .catch((e) => {
            this.$log.debug('Failed to load device')
            this.$log.error(e)
          })
        } else {
          alert("Please enter user ID")
        }
      }
    }
  }
</script>