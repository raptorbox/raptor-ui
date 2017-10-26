<template>
  <div class="animated fadeIn">
    <div class="row">
      <div>
        <b-card class="bg-danger" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
          <div class="card-body pb-0">
            <h4 class="mb-0">Device Details</h4>
          </div>
          <div class="card-body pb-0">
            <span v-html="selectedDeviceDetails"></span>
          </div>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->

    <b-card>
      <div class="row">
        <div class="col-sm-5">
          <h4 class="card-title mb-0">{{deviceName}}</h4>
          <!-- <div class="small text-muted">{{deviceDataTime}}</div> -->
        </div><!--/.col-->
        <div class="col-sm-7 hidden-sm-down">
          <!-- <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button-group class="mr-3" aria-label="First group"> -->
              <!-- <b-button variant="outline-secondary" value="minutes" @click="onChangeDisplayDataTime">Minutes</b-button>
              <b-button variant="outline-secondary" value="hours" @click="onChangeDisplayDataTime">Hours</b-button>
              <b-button variant="outline-secondary" value="day" @click="onChangeDisplayDataTime">Day</b-button> -->
              <!-- <b-button variant="outline-secondary" value="week" @click="onChangeDisplayDataTime">Week</b-button> -->
              <!-- <b-button variant="outline-secondary" value="month" @click="onChangeDisplayDataTime">Month</b-button> -->
            <!-- </b-button-group>
          </b-button-toolbar> -->
          <div class="float-right">
            <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionChannel" v-model="selectedChannel" :options="optionsChannel" />
          </div>
          <div class="float-right">
            <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
          </div>
        </div><!--/.col-->
      </div><!--/.row-->
      <div class="chart-wrapper">
        <chart-streams style="height:300px;margin-top:40px;" :chartLabel="selectedChannel" :data="dataChartDevice" :labels="streamChartLabels" height="300"></chart-streams>
        <div slot="footer">
          <span v-html="streamChartDetails"></span>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
import ChartStreams from './../stats/ChartStreams'
import moment from 'moment'

export default {
  name: 'realtimechart',
  components: {
    ChartStreams
  },
  data () {
    return {
      loading: false,
      error: null,
      selectedDev : null,
      selectedDeviceDetails: null,
      streamChartDetails: null,
      label: [],
      dictUser: {},
      dataChartUser: [10, 39, 10, 40, 39, 0, 0],
      optionsStreams: [
      { value: null,              text: 'Please select a stream' }
      ],
      selectedDevice: 'memosa-car',
      dictDevice: {},
      streamChartLabels: [],
      dataChartDevice: [],
      deviceDataTime : null,
      deviceName: null,
      selectedStream : null,
      selectedStreamData: null,
      listOfDevicesForSelectOptions : [{ value: null, text: 'Please select a device' }],
      totalNoOfDevices : 0,
      colorVarients: ['green','blue','lightblue','yellow','red','pink','black','purple','cyan','orange','brown'],
      selectedChannel: null,
      optionsChannel: [{ value: null, text: 'Please select a Channel' }],
      dataSubscribed: false
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
      return moment(new Date(d)).format('MMMM Do YYYY');
    },
    load(dev) {
      this.$raptor.Inventory().read(dev)
      .then((device) => {
        // console.log(device)
        this.selectedDev = device;
        this.deviceName = device.name;
        this.selectedDeviceDetails = '<ul>';
        this.selectedDeviceDetails += '<li><strong>Name:</strong>     ' + device.name + '</li>';
        this.selectedDeviceDetails += '<li><strong>id:</strong>       ' + device.id + '</li>';
        this.selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(device.createdAt*1000) + '</li>';
        this.selectedDeviceDetails += '</ul>';
        this.fetchData(device)
      })
      .catch((e) => {
        this.$log.debug('Failed to load device')
        this.$log.error(e)
        this.loading = false
      })
    },
    fetchData (device) {
      let keys = Object.keys(device.json.streams);
      console.log(keys);
      this.optionsStreams = [];
      this.optionsStreams.push({ value: null,text: 'Please select a stream' });
      for (var i = 0; i < keys.length; i++) {
        this.optionsStreams.push({ value: keys[i],text: keys[i] });
      }
      this.selectedStream = keys[0];
      this.dataSubscribed = false;
    },
    extractChartDataDeviceStreamOneChannel (d, val, channel, pushData) {
      this.dictDevice = [];
      this.streamChartLabels = []
      for (var i = 0; i < d.length; i++) {
        let s = d[i];
        if(i == 0) {
          this.deviceDataTime = this.formatDate(s.timestamp * 1000);
        }
        this.streamChartLabels.push((new Date(s.timestamp * 1000)).toUTCString());
        let sDate = this.getDate(s, val)
        if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean') {
          if(!this.dictDevice[sDate]) {
            this.dictDevice[sDate] = [];
          }
          if(this.dictDevice[sDate]) {
            this.dictDevice[sDate].push(s.channels[channel]);
          }
        }
      }
    },
    getDate(s, val) {
      let sDate = (new Date(s.timestamp * 1000)).getMinutes();
      if(val == 'hours'){
        sDate = (new Date(s.timestamp * 1000)).getHours();
      } else if(val == 'day'){
        sDate = (new Date(s.timestamp * 1000)).getDay();
      } else if(val == 'month'){
        sDate = (new Date(s.timestamp * 1000)).getMonth();
      }
      return sDate;
    },
    fetchStreamData (str) {
      var context = this;
      var ts = Math.round((new Date()).getTime() / 1000);
      let stream = this.selectedDev.getStream(str);
      if(stream){
        this.$raptor.Stream().list(stream, 0, ts)
        .then((streams) => {
          context.selectedStreamData = streams;
        })
        .catch(function(e) {
          console.log(e)
          console.log(JSON.stringify(e))
          if(e.toString().indexOf("Unauthorized") !== -1) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
          }
        });
      }
    },
    getChannelsDetails (channels) {
      this.streamChartDetails = null;
      this.streamChartDetails = '<ul>';
      for (var i = 0; i < channels.length; i++) {
        this.streamChartDetails += '<li>';
        this.streamChartDetails += '<div class="text-muted">'+ channels[i] +'</div>';
        this.streamChartDetails += '<div class="mt-2" style="min-height: 5px; padding-left: 10%; padding-right:10%;background:' + this.colorVarients[i] + '" />';
        this.streamChartDetails += '</li>'
      }
      this.streamChartDetails += '</ul>';
    },
    changeData: function() {
      let arr = Array();
      for (var i = 0; i < this.label.length; i++) {
        let s = this.label[i];
        arr.push(this.dictUser[s]);
      }
      this.dataChartUser = arr;
    },
    changeStreamData: function() {
      let arr = Array();
      let streamChartLabels = [];
        streamChartLabels = Object.keys(this.dictDevice); // getting labels
        for (var i = 0; i < streamChartLabels.length; i++) {
          let s = streamChartLabels[i];
          arr.push(this.dictDevice[s]);
        }
        this.dataChartDevice = arr;
      },
      getNode () {
        let name = "memosa-nodes"
        return this.$raptor.Tree().list().then((list) => {
          const res = list.filter((n) => n.name === name)
          if (res.length === 0) {
            console.log("Creating new `%s` node", name)
            return this.$raptor.Tree().create({name})
          }
          console.log("Found `%s` node", name)
          return Promise.resolve(res[0])
        })
      },
      addDeviceNode (parentNode, device) {
        console.log("Adding to group %s device %s (id:%s)", parentNode.name, device.name, device.id)
        return this.$raptor.Tree().add(parentNode, new Raptor.models.Tree({
          userId: parentNode.userId,
          name: device.name,
          id: device.id,
          type: "device"
        }))
      },
      onChangeOptionStream (evt) {
        // console.log(this.selectedDev.json.streams[this.selectedStream])
        // if(!this.dataSubscribed) {
          this.unsubscribeStream(this.selectedDev.json.streams[this.selectedStream]);
        //   this.dataSubscribed = true;
        // }
        let val = evt.target.value;
        if(this.selectedDev) {
          let stream = this.selectedDev.json.streams[val];
          let keys = Object.keys(stream.channels);
          this.optionsChannel = [];
          this.optionsChannel.push({ value: null,text: 'Please select a Channel' });
          for (var i = 0; i < keys.length; i++) {
            if(stream.channels[keys[i]].type === 'number' || stream.channels[keys[i]].type === 'boolean') {
              this.optionsChannel.push({ value: keys[i],text: keys[i] });
            } else {
              this.optionsChannel.push({ text: keys[i], disabled: true });
            }
          }
          this.fetchStreamData(val);
          this.subscribeStream(stream);
        }
      },
      onChangeDisplayDataTime (evt) {
        let val = evt.target.value;
        console.log(val)
        if(this.selectedStreamData && this.selectedChannel) {
          this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData, val, this.selectedChannel);
          this.changeStreamData();
        }
      },
      onChangeOptionChannel (evt) {
        let val = evt.target.value;
        this.dictDevice = [];
        if(this.selectedStreamData) {
          this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData,'minutes',val);
          this.changeStreamData();
        }
      },
      subscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().subscribe(stream, function(msg) {
          console.log(msg)
          context.selectedStreamData.push(msg.record);
          context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,'minutes',context.selectedChannel);
          context.changeStreamData();
          // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
          //   return
          // }
          context.loading = false;
        });
      },
      unsubscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      }
    }
  }
  </script>
