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
              <p style="text-align: center; font-weight:bold; margin:0;">Streams</p>
            </div>
            <div class="col-md-2 col-md-offset-2" style="float: right;">
              <div class="row" style="margin-left:auto; margin-right:0;">
                <div class="col-md-6" right>
                  <div class="float-right">
                    <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
                  </div>
                  <!-- <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create User</b-button> -->
                </div>
                <div class="col-md-6" right>
                  <b-form-fieldset horizontal>
                    <b-form-select :options="pageOptions" v-model="perPage" />
                  </b-form-fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-table striped hover show-empty :items="deviceStreams" :fields="fields" :current-page="currentPage" :per-page="perPage" >
          <!-- <span v-html="streamDetail"></span> -->
          <!-- <template slot="time" scope="row">
            {{formatDate(row.item.timestamp*1000)}}
          </template>

          <template slot="stream" scope="row">{{row.item.streamId}}</template>
          <template slot="sensor" scope="row">{{row.item.channels.current}}</template>
          <template slot="engine" scope="row">{{row.item.channels.enginerpm}}</template>
          <template slot="speed" scope="row">{{row.item.channels.speed}}</template> -->
          <!-- <template slot="actions" scope="row">
            <click-confirm>
              <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.item)">Delete</b-button>
            </click-confirm>
          </template> -->
        </b-table>
        <div>
          <b-pagination :total-rows="deviceStreams.length" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" />
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
    name: 'stream_list',
    data() {
      return {
        loading: false,
        list: null,
        error: null,
        currentPage: 1,
        fields: {
          // time:          { label: 'Time' },
          // stream:        { label: 'Stream' },
          // sensor:        { label: 'SensorID' },
          // engine:        { label: 'EnginRPM'},
          // speed:         { label: 'Speed'},
          // actions:       { }
        },
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}],
        streams: [],
        deviceStreams: [],
        device: null,
        selectedStream: null,
        optionsStreams: [],
        streamDetail: null
      }
    },
    mounted () {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
      }
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
          console.log(device)
          this.streams = device.streams
          this.loading = false
          this.device = device;
          this.getStreamOptions();
          // this.getStream("obd");
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
      },
      getStream(streamName) {
        var ts = Math.round((new Date()).getTime() / 1000);
        let stream = this.device.getStream(streamName);
        console.log(stream)
        if(stream){
          this.loading = true
          this.$raptor.Stream().list(stream, 0, ts)
          .then((streams) => {
            console.log(streams)
            this.deviceStreams = [];
            let fields = {}
            for (var i = 0; i < streams.length; i++) {
              let obj = {}
              let stream = streams[i].json
              obj['timestamp'] = this.formatDate(stream['timestamp']*1000)
              obj['streamId'] = stream['streamId']
              if(i==0){
                fields['timestamp'] = { label: 'Time' }
                fields['streamId'] = { label: 'Stream' }
                Object.keys(stream.channels).forEach(function(ch) {
                  fields[ch] = { label: ch }
                })
                this.fields = fields
              }
              for(var ch in stream.channels) {
                obj[ch] = stream.channels[ch]
              }
              this.deviceStreams.push(obj);
              this.loading = false
            }
          })
          .catch((e) => {
            this.$log.debug('Failed to load streams')
            this.$log.error(e)
            this.loading = false
          })
        }
      },
      getStreamOptions () {
        if(this.device) {
          let keys = Object.keys(this.device.json.streams);
          // console.log(keys);
          this.optionsStreams = [];
          this.optionsStreams.push({ value: null,text: 'Please select a stream' });
          for (var i = 0; i < keys.length; i++) {
            this.optionsStreams.push({ value: keys[i],text: keys[i] });
          }
          this.selectedStream = keys[0];
        }
      },
      onChangeOptionStream (evt) {
        let val = evt.target.value;
        if(this.device) {
          // if(!this.loading) {
            this.getStream(val);
          // }
        }
      },
      remove (stream) {
        this.$log.debug("Deleting %s", stream)
        console.log(stream)
        this.$raptor.Stream().delete(stream)
        .then(() => {
          this.$log.debug("Deleted %s", stream)
          this.fetchData()
        })
        .catch((e) => {
          this.$log.error("Error deleting %s", e)
        })
      },
    }

  }
</script>