<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- bg-variant="info" border-variant="light" header="<span class='float-left'>Streams</span> <span class='float-right'><button class='btn btn-primary' type='button' @click='(event) => { onAddStreamButton(event) }'>Add Stream</button></span>"> -->

      <div class="clearfix" style="background-color: #f0f3f5; padding:10px;">
        <div>
          <div class="text-left text-center" style="float: left;">
            <p style="text-align: center; font-weight:bold; margin:0;">Streams</p>
          </div>
          <div class="col-md-2" style="float: right;">
            <div style="float: right;" right>
              <button class='btn btn-primary' type='button' @click='(event) => { onAddStreamButton(event) }'>Add Stream</button>
            </div>
          </div>
        </div>
      </div>

      <div v-for="stream in tableDataStreams" id="stream">
        <b-card>
          <div class="clearfix" style="background-color: #f0f3f5; padding:10px;">
            <div>
              <div class="text-left text-center" style="float: left;">
                <!-- <p style="text-align: center; font-weight:bold; margin:0;">{{stream.title}}</p> -->
                <b-form-input v-model="stream.title"
                type="text" style="border: none !important; border-color: transparent !important; background-color: transparent !important; font-weight: bold;"
                placeholder="Enter Stream Name"></b-form-input>
              </div>
              <div class="col-md-2" style="float: right;">
                <div style="float: right;" right>
                  <b-button class="btn btn-danger" data="stream" @click="(event) => { onDeleteStream(event, stream) }">Delete Stream</b-button>
                </div>
                <div style="float: right;" right>
                  <b-button class="btn btn-primary" data="stream" @click="(event) => { onCreateChannelButton(event, stream) }">Add Channel</b-button>
                </div>
              </div>
            </div>
          </div>
          <!-- style="background-color:#f0f0f0" -->
          <div id="channelDiv" data="stream" style="padding: 10px">
            <div id="channelDivHeader" class="row row-fluid">
              <div class="col-md-3 text-left" style="padding: 10px">
                <label><strong>Channel Name</strong></label>
              </div>
              <div class="col-md-3 text-left" style="padding: 10px">
                <label><strong>Channel Type</strong></label>
              </div>
              <div class="col-md-3 text-left" style="padding: 10px">
                <label><strong>Channel Unit</strong></label>
              </div>
            </div>
            <div id="channelDivDetail" class="row row-fluid" v-for="channel in stream.channels">
              <div class="col-md-3 text-left" id="divChannelName" v-bind:data="stream" :data-ch="channel" style="padding: 10px">
                <b-form-input v-model="channel.name"
                type="text"
                placeholder="Enter Channel Name"></b-form-input>
                <!-- style="border: none !important; border-color: transparent !important;" -->
              </div>
              <div class="col-md-3 text-left" id="divChannelType" data="stream" data-ch="channel" style="padding: 10px">
                <b-form-select variant="outline-secondary" class="mr-3" @change.native="(event) => { onChangeOptionChannelType(event, stream, channel) }" v-model="channel.type" :options="channelTypes"> </b-form-select>
              </div>
              <div class="col-md-3 text-left" id="divChannelUnit" data="stream" data-ch="channel" style="padding: 10px">
                <b-form-input v-model="channel.unit"
                type="text"
                placeholder="Enter Channel Unit"></b-form-input>
              </div>
              <div class="col-md-3 text-center" data="stream" data-ch="channel" right style="padding: 10px">
                <button class="btn btn-danger" type="button" @click="(event) => { onDeleteChannelButton(event, stream, channel) }">Delete</button>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </div>
</template>



<script>
  import moment from 'moment'
  export default {
    name: 'stream_list',
    props: ['SaveData','deviceData'],
    data() {
      return {
        loading: false,
        list: null,
        error: null,
        stream: null,
        channelUnit: null,
        channelName: null,
        channelTypes: [
        { value: null,              text: 'Please select a channel type' },
        { value: 'string', text: 'string' },
        { value: 'number',      text: 'number' },
        { value: 'boolean',     text: 'boolean' }
        ],
        selectedChannelType: null,
        perPage: 10,
        totalRows: 0,
        pageOptions: [{text:10,value:10},{text:25,value:25},{text:50,value:50}],
        streams: [],
        deviceStreams: [],
        device: null,
        selectedStream: null,
        optionsStreams: [],
        tableDataStreams: []
      }
    },
    mounted () {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
      }
    },
    watch: {
      SaveData () {
        console.log("in stream component")
        if(this.deviceData != null) {
          this.device = this.deviceData
          console.log(this.device)
        }
        this.onSaveStreamButton()
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
          this.streams = device.json.streams
          // console.log(device)
          console.log(JSON.stringify(device))
          this.loading = false
          this.device = device;
          this.getStreams();
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
      },
      getStreams() {
        var context = this;
        let streamObjects = Object.keys(this.streams);
        for (var i = 0; i < streamObjects.length; i++) {
          let key = streamObjects[i]
          let obj = {}
          let channelsObject = Object.keys(this.streams[key].channels)
          let channels = []
          for (var j = 0; j < channelsObject.length; j++) {
            let channelKey = channelsObject[j]
            let channel = this.streams[key].channels[channelKey]
            channel['id'] = j
            channels.push(channel)
          }
          obj.channels = channels
          obj.title = key
          this.tableDataStreams.push(obj)
        }
        // console.log(this.tableDataStreams)
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
      onChangeOptionChannelType (evt, stream, channel) {
        let val = evt.target.value;
        // for (var i = 0; i < stream.channels.length; i++) {
        //   if(channel.id == stream.channels[i].id){
        //     stream.channels['type'] = val;
        //     break
        //   }
        // }
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          if(this.tableDataStreams[i].title == stream.title) {
            let channels = this.tableDataStreams[i].channels
            for (var j = 0; j < channels.length; j++) {
              if(channel.id == channels[j].id){
                channels[j]['type'] = val;
                break
              }
            }
          }
        }
      },
      onCreateChannelButton (evt, stream) {
        let val = evt.target.value;
        let obj = {name: "",
        type: this.channelTypes,
        id: stream.channels.length,
        unit: ""};
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          if(this.tableDataStreams[i].title == stream.title) {
            this.tableDataStreams[i].channels.push(obj)
          }
        }
      },
      onDeleteChannelButton (evt, stream, channel) {
        // for (var i = 0; i < stream.channels.length; i++) {
        //   // console.log(channel.id + " => " + stream.channels[i].id)
        //   if(channel.id == stream.channels[i].id){
        //     stream.channels.splice(i,1);
        //     // console.log("removed " + i)
        //     break
        //   }
        // }
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          if(this.tableDataStreams[i].title == stream.title) {
            let channels = this.tableDataStreams[i].channels
            for (var j = 0; j < channels.length; j++) {
              if(channel.id == channels[j].id){
                channels.splice(j,1);
                break
              }
            }
            // console.log(stream)
            // this.tableDataStreams[i] = stream
          }
        }
      },
      onSaveStreamButton () {
        let json = this.device.toJSON()
        // console.log(stream)
        let updatedStream = {}
        // let keys = Object.keys(this.streams)
        // for (var i = 0; i < keys.length; i++) {
        //   console.log(keys[i])
        //   if(this.streams[stream.title] && keys[i] == stream.title) {
        //     console.log(this.streams[stream.title])
        //     let obj = {}
        //     for (var j = 0; j < stream.channels.length; j++) {
        //       obj[stream.channels[j].name] = stream.channels[j].type
        //     }
        //     updatedStream[stream.title] = obj
        //   } else {
        //     console.log(this.streams[keys[i]])
        //     let obj = {}
        //     let stChannels = this.streams[keys[i]].channels
        //     let chKeys = Object.keys(stChannels)
        //     console.log(chKeys)
        //     console.log(stChannels)
        //     for (var j = 0; j < chKeys.length; j++) {
        //       obj[stChannels[chKeys[j]].name] = stChannels[chKeys[j]].type
        //     }
        //     updatedStream[keys[i]] = obj
        //   }
        // }
        // add new strem
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          let st = this.tableDataStreams[i]
          let obj = {}
          for (var j = 0; j < st.channels.length; j++) {
            obj[st.channels[j].name] = st.channels[j].type
          }
          updatedStream[st.title] = obj
        }
        console.log("=============================updated stream=============================")
        // console.log(updatedStream)
        console.log(JSON.stringify(updatedStream))
        json = Object.assign({}, json, {
          streams: updatedStream,
          actions: json.actions,
          name: json.name,
          description: json.description
        })
        console.log(json)
        console.log("=============================final stored stream=============================")
        return this.$raptor.Inventory().update(json)
      },
      onDeleteStream (evt, stream) {
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          if(stream.title == this.tableDataStreams[i].title){
            this.tableDataStreams.splice(i,1);
            break
          }
        }
      },
      onAddStreamButton (evt) {
        var st = {
          channels: [{
            name: "",
            type: this.channelTypes,
            unit: ""
          }],
          title: ""
        }
        // console.log(JSON.stringify(st))
        this.tableDataStreams.push(st)
      }
    }

  }
</script>