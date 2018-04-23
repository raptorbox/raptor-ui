<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- <b-card header="<i class='fa fa-align-justify'></i> Users"> -->
      <b-card>
          <div slot="header">
              <div class="row row-fluid">
                  <div class="col-md-6 list-inline">
                      <div>
                          <div class="col-md-3">
                              <h3 class="list-inline-item">Streams</h3>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-6 text-right">
                      <div class="row">
                          <div class="col-md-6" left>
                              <b-form-fieldset description="Select Stream" label="Stream" horizontal>
                                  <b-form-select variant="outline-secondary" @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
                              </b-form-fieldset>
                          </div>
                          <div class="col-md-6" right>
                              <b-form-fieldset description="Items per page" label="Show" horizontal>
                                  <b-form-select :options="pageOptions" v-model="perPage" @change="itemsLimitChange"/>
                              </b-form-fieldset>
                          </div>
                      </div>
                  </div>
              </div>

          </div>

          <b-table no-local-sorting small responsive show-empty :items="deviceStreams" :fields="fields" @sort-changed="sortingChanged">
          </b-table>
          <div>
            <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
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

        // page settings
        sortBy: 'timestamp',
        sortDir: "desc",
        perPage: 25,
        currentPage: 1,
        pager: null,

        // selected stream info
        streamDetail: null,
        deviceId: null,
      }
    },
    mounted () {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.deviceId = this.$route.params.deviceId
        this.load(this.$route.params.deviceId)
      }
    },
    created() {
      document.addEventListener('beforeunload', this.handler())
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY HH:mm:ss')
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
          this.$toasted.show(e.message).goAway(3000)
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
      },
      getStream(streamName) {
        // var ts = Math.round((new Date()).getTime() / 1000);
        let stream = this.device.getStream(streamName);
        this.streamDetail = stream
        // console.log(stream)
        if(stream){
          this.loading = true
          let paging = {
            page: this.currentPage-1,
            size: this.perPage,
            sort: this.sortBy,
            sortDir: this.sortDir,
          }
          this.$raptor.Stream().list(stream, paging)
          .then((pager) => {
            // console.log(streams)
            let streams = pager.getContent()
            this.pager = pager
            this.totalRows = pager.getTotalElements()

            this.deviceStreams = [];
            let fields = {}
            for (var i = 0; i < streams.length; i++) {
              let obj = this.extractDataToShow(streams[i].json, i)
              this.deviceStreams.push(obj);
              this.loading = false
            }
            this.subscribeStream(stream)
          })
          .catch((e) => {
            if(e.message == 'Access is denied') {
              this.$toasted.show(e.message).goAway(3000)
            }
            this.$log.debug('Failed to load streams')
            this.$log.error(e)
            this.loading = false
          })
        }
      },
      extractDataToShow(stream, i) {
        let obj = {}
        obj['timestamp'] = this.formatDate(stream['timestamp']*1000)
        obj['streamId'] = stream['streamId']
        if(i && i == 0){
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
        return obj
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
        this.unsubscribeStream(this.streamDetail)
        if(this.device) {
          // if(!this.loading) {
            this.getStream(val);
            this.selectedStream = val
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

      // paging functions
      pageChanged(page) {
        this.currentPage = page
        this.unsubscribeStream(this.streamDetail)
        this.getStream(this.selectedStream)
      },
      sortingChanged(ev) {
        this.sortBy = ev.sortBy
        this.sortDir = ev.sortDesc ? 'desc' : 'asc'
        this.unsubscribeStream(this.streamDetail)
        this.getStream(this.selectedStream)
      },
      itemsLimitChange(limit) {
        this.currentPage = 1
        this.perPage = limit
        this.getStream(this.selectedStream)
      },

      //**************************************************** */
      /* new features                                        */
      /* 1. Stream subscription in list                      */
      /* *************************************************** */

      handler () {
        if(this.selectedStream)
          this.unsubscribeStream ({name: this.selectedStream, deviceId: this.deviceId});
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (stream) {
        let context = this
        this.$raptor.Stream().subscribe(stream, function(msg) {
          // console.log(msg.record)
          let first = context.deviceStreams[0]
          if(first.timestamp != msg.record.timestamp && context.selectedStream == msg.record.streamId) {
            context.limitArrayAndPush(context.deviceStreams, context.perPage, context.extractDataToShow(msg.record))
          }
        });
      },
      unsubscribeStream (stream) {
        if (stream) {
          this.$raptor.Stream().unsubscribe(stream, function(msg) {
            console.log(msg)
          });
        }
      },
      // limit the array and push data
      limitArrayAndPush(array, limit, data) {
        array.unshift(data)
        if(array.length > limit) {
          array.pop()
        }
      },
      gotError (e) {
        if(this.$log) {
          this.$log.debug('Failed to load streams')
          if (e.toString().indexOf('Unauthorized') !== -1) {
            this.$raptor.Auth().logout()
            if(this.$router) {
              this.$router.push('/pages/login')
            }
          }
        }
      }
    }

  }
</script>