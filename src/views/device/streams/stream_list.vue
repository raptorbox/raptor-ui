<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- style="background-color:#f5f5dc" -->
      <b-card> 
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
                  <p style="text-align: center; font-weight:bold; margin:0;">{{stream.title}}</p>
                </div>
                <div class="col-md-2" style="float: right;">
                  <div style="float: right;" right>
                    <b-button class="btn btn-danger" data="stream" @click="(event) => { onDeleteStream(event, stream) }">Delete Stream</b-button>
                  </div>
                  &nbsp;
                  &nbsp;
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
                  <b-form-select variant="outline-secondary" class="mr-3" @change.native="(event) => { onChangeOptionChannelType(event, stream, channel) }" v-model="channel.type" :options="channelTypes" />
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
              <div class="float-right" right>
                <button class="btn btn-success" type="button" @click="(event) => { onSaveStreamButton(event, stream) }">Save</button>
              </div>
              <!-- <b-table show-empty :items="stream.channels" :fields="stream.fields"> -->
            <!-- <template slot="description" scope="row">{{row.item.description}}</template>
            <template slot="created" scope="row">{{formatDate(row.item.createdAt * 1000)}}</template>
            <template slot="updated" scope="row">{{formatDate(row.item.updatedAt * 1000)}}</template>
            <template slot="actions" scope="row">
              <div class="row">
                <b-button class="btn btn-sm" :to="{ name: 'Streams', params: { deviceId: row.item.id }}">Streams</b-button>
                <b-button class="btn btn-primary btn-sm" :variant="primary" :to="{ name: 'RecordSet', params: { deviceId: row.item.id }}">Records</b-button>
                <click-confirm>
                  <b-button class="btn btn-outline-danger btn-sm" :variant="danger" @click="remove(row.item.id)">Delete</b-button>
                </click-confirm>
              </div>
            </template> -->
            <!-- </b-table> -->
          </b-card>
        </div>
        <!-- <span v-html="streamDetails"></span> -->
      </b-card>
    </div>
  </div>
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
      onChangeOptionStream (evt) {
        let val = evt.target.value;
        console.log(val)
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
        // console.log(val)
        let parent = evt.target.parentElement
        // console.log(parent)
        for (var i = 0; i < stream.channels.length; i++) {
          if(channel.id == stream.channels[i].id){
            stream.channels['type'] = val;
            break
          }
        }
        // for (var i = 0; i < this.streams.length; i++) {
        //   if(this.streams[i].title == stream.title) {
        //     this.streams = stream
        //   }
        // }
      },
      onCreateChannelButton (evt, stream) {
        let val = evt.target.value;
        // console.log(stream)
        // console.log(evt.target)
        // for (var i = 0; i < stream.length; i++) {
        //   if(stream[i].channels
        // }
        stream.channels.push({name: "",
          type: this.channelTypes,
          unit: ""})
        // console.log(stream)
        // for (var i = 0; i < this.streams.length; i++) {
          // if(this.streams[stream.title]) {
          //   this.streams[stream.title].channels[name] = {name: "",
          //     type: this.channelTypes,
          //     unit: ""}
          // }
        // }
        // console.log(JSON.stringify(this.streams))
        // let parent = evt.target.parentElement
        // console.log(parent)
        // console.log(parent.data)
      },
      onDeleteChannelButton (evt, stream, channel) {
        // let val = evt.target.value;
        // console.log("stream" + JSON.stringify(stream))
        // console.log("channel" + JSON.stringify(channel))
        for (var i = 0; i < stream.channels.length; i++) {
          if(channel.id == stream.channels[i].id){
            stream.channels.splice(i,1);
            break
          }
        }
        for (var i = 0; i < this.streams.length; i++) {
          if(this.streams[i].title == stream.title) {
            this.streams = stream
          }
        }
        // let parent = evt.target.parentElement
        // console.log(parent)
        // console.log(parent.data)
      },
      onSaveStreamButton (evt, stream) {
        let json = this.device.toJSON()
        // console.log(stream)
        let updatedStream = {}
        let keys = Object.keys(this.streams)
        for (var i = 0; i < keys.length; i++) {
          console.log(keys[i])
          if(this.streams[stream.title] && keys[i] == stream.title) {
            console.log(this.streams[stream.title])
            let obj = {}
            for (var j = 0; j < stream.channels.length; j++) {
              obj[stream.channels[j].name] = stream.channels[j].type
            }
            updatedStream[stream.title] = obj
          } else {
            console.log(this.streams[keys[i]])
            let obj = {}
            let stChannels = this.streams[keys[i]].channels
            let chKeys = Object.keys(stChannels)
            console.log(chKeys)
            console.log(stChannels)
            for (var j = 0; j < chKeys.length; j++) {
              obj[stChannels[chKeys[j]].name] = stChannels[chKeys[j]].type
            }
            updatedStream[keys[i]] = obj
          }
        }
        // add new strem
        for (var i = 0; i < this.tableDataStreams.length; i++) {
          if(this.tableDataStreams[i].title == updatedStream[]){
            
          }
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
        // return this.$raptor.Inventory().update(json)
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
          channels: {
            name: "",
            type: this.channelTypes,
            unit: ""
          },
          title: "new stream"
        }
        // console.log(JSON.stringify(st))
        this.tableDataStreams.push(st)
      }
    }

  }
</script>