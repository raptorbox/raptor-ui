<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="container">
        <div v-if="!inventorychart">
          <div class="row">
            <div class="col-sm-6 col-lg-4">
               <!-- style="min-height:160px; max-height:160px; height:160px" -->
              <b-card class="bg-success" :no-block="true">
                <div class="card-body pb-0">
                  <h4 class="mb-0">{{totalNoOfDevices}}</h4>
                  <p>Total Devices</p>
                </div>
                <div class="chart-wrapper">
                  <line-chart-total-devices style="height:70px;" :data="dataChartDevices" :labels="labelChartDevices" height="70"/>
                </div>
              </b-card>
            </div><!--/.col-->
            <div class="col-sm-6 col-lg-4">
               <!-- style="min-height:160px; max-height:160px; height:160px" -->
              <b-card class="bg-info" :no-block="true">
                <div class="card-body pb-0">
                  <h4 class="mb-0">Select a Device</h4>
                  <div class="float-right">
                    <select class="mb-3 form-control" @change="onChangeDevice">
                      <option v-for="dev in listOfDevicesForSelectOptions" v-bind:value="dev.value">{{dev.text}}</option>
                    </select>
                  </div>
                </div>
              </b-card>
            </div><!--/.col-->
            <div class="col-sm-6 col-lg-4">
               <!-- style="min-height:160px; max-height:160px; height:160px" -->
              <b-card class="bg-danger" :no-block="true">
                <div class="card-body pb-0">
                  <h4 class="mb-0">Device Details</h4>
                </div>
                <div class="card-body pb-0">
                  <span v-html="selectedDeviceDetails"></span>
                </div>
              </b-card>
            </div><!--/.col-->
          </div><!--/.row-->
        </div>
        <div v-if="inventorychart">
           <!-- style="min-height:160px; max-height:160px; height:160px" -->
          <b-card class="bg-danger" :no-block="true">
            <div class="card-body pb-0">
              <h4 class="mb-0">Device Details</h4>
            </div>
            <div class="card-body pb-0">
              <span v-html="selectedDeviceDetails"></span>
            </div>
          </b-card>
        </div><!--/.col-->
      </div>
    </div><!--/.row-->

    <b-card>
      <div class="row">
        <div class="col-sm-5">
          <h4 class="card-title mb-0">{{deviceName}}</h4>
          <!-- <div class="small text-muted">{{deviceDataTime}}</div> -->
        </div><!--/.col-->
        <div class="col-sm-7 hidden-sm-down">
          <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button-group class="mr-3" aria-label="First group">
              <!-- <b-button variant="outline-secondary" value="minutes" @click="onChangeDisplayDataTime">Minutes</b-button> -->
              <b-button variant="outline-secondary" value="hour" @click="onChangeDisplayDataTime">Hours</b-button>
              <b-button variant="outline-secondary" value="day" @click="onChangeDisplayDataTime">Day</b-button>
              <!-- <b-button variant="outline-secondary" value="week" @click="onChangeDisplayDataTime">Week</b-button> -->
              <b-button variant="outline-secondary" value="month" @click="onChangeDisplayDataTime">Month</b-button>
              <b-button variant="outline-secondary" value="realhour" @click="onChangeDisplayDataTime">Real time</b-button>
            </b-button-group>
          </b-button-toolbar>
          <div class="float-right">
            <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionChannel" v-model="selectedChannel" :options="optionsChannel" />
          </div>
          <div class="float-right">
            <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
          </div>
        </div><!--/.col-->
      </div><!--/.row-->
      <div class="chart-wrapper">
        <chart-streams :chartLabel="selectedChannel" :data="dataChartDevice" :labels="streamChartLabels"></chart-streams>
        <div slot="footer">
          <span v-html="streamChartDetails"></span>
        </div>
      </div>
      <div class="container">
        <vue-slider ref="slider" v-bind="slider" v-model="slider.value" @callback="sliderValueChanged" @drag-start="sliderDragStart" @drag-end="sliderDragEnd" >
          <!-- <template slot="tooltip" scope="tooltip">
            <div>
              {{ formatDate(tooltip.value*1000) }}
            </div>
          </template> -->
        </vue-slider>
      </div>
    </b-card>
  </div>
</template>

<style>
/*.slider {
   overwrite slider styles 
  width: 200px;
}*/
</style>

<script>
import ChartStreams from './ChartStream'
import moment from 'moment'
// range slider for chartjs
import vueSlider from 'vue-slider-component'

// dashboard realted
import LineChartTotalDevices from './../../stats/LineChartTotalDevices'

var currentDate = moment();

export default {
  name: 'realtimechart',
  components: {
    ChartStreams,
    vueSlider,
    LineChartTotalDevices
  },
  data () {
    return {
      loading: false,
      error: null,
      selectedDev : null,
      selectedDeviceDetails: null,
      streamChartDetails: null,
      realtimeData: null,
      realtimeDataLabels: null,
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
      dataSubscribed: false,
      // for checking whether page is investory chart or dashboard
      inventorychart: false,
      devices: [],
      dataChartDevices: [],
      labelChartDevices: [],
      dictChartDevices: {},
      // slider value to show the instances of reading in chart
      selectedDisplayParam: null,
      realData: null,
      realStreamChartLabels: [],
      isSliderDragging: false,
      isSliderDragged: false,
      slider: {
        value: [
          currentDate.format("YYYY-MM-DDTHH:MM") +"",
          currentDate.subtract(1, 'hours').format("YYYY-MM-DDTHH:MM") +""
        ],
        eventType: 'auto',
        width: 'auto',
        height: 6,
        dotSize: 16,
        dotHeight: null,
        dotWidth: null,
        interval: 1,
        show: true,
        speed: 0.5,
        disabled: false,
        piecewise: true,
        // piecewiseStyle: {
        //   "backgroundColor": "#ccc",
        //   "visibility": "visible",
        //   "width": "12px",
        //   "height": "12px"
        // },
        piecewiseLabel: false,
        // piecewiseActiveStyle: {
        //   "backgroundColor": "#3498db"
        // },
        tooltip: "always",
        tooltipDir: ["top","bottom"],
        reverse: true,
        style: {
          "marginTop": "4%",
          "marginBottom": "4%"
        },
        data: null,
        clickable: true,
        realTime: true,
        lazy: false,
        // formatter: "{value}",
        bgStyle: {
          "backgroundColor": "#fff",
          "boxShadow": "inset 0.5px 0.5px 3px 1px rgba(0,0,0,.36)"
        },
        sliderStyle: [
          {
            "backgroundColor": "#f05b72"
          },
          {
            "backgroundColor": "#3498db"
          }
        ],
        processStyle: null,
        piecewiseStyle: null,
        tooltipStyle: [
          {
            "backgroundColor": "#f05b72",
            "borderColor": "#f05b72"
          },
          {
            "backgroundColor": "#3498db",
            "borderColor": "#3498db"
          }
        ],
        labelStyle: null,
        labelActiveStyle: null,
        labelActiveStyle: {
          "color": "#3498db"
        }
      },
    }
  },
  mounted () {
    if (this.$route.params.deviceId) {
      // this.$log.debug('Load %s ', this.$route.params.deviceId)
      this.load(this.$route.params.deviceId)
    }
    this.$nextTick(() => this.$refs.slider.refresh())
    // console.log(this.$route.path.indexOf('inventory') != -1 && this.$route.path.indexOf('chart') != -1)
    if(this.$route.path.indexOf('inventory') != -1 && this.$route.path.indexOf('chart') != -1) {
      this.inventorychart = true
      // console.log("not here")
      // this.data.id = null
    } else {
      this.fetchData()
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
        this.selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(device.json.createdAt*1000) + '</li>';
        this.selectedDeviceDetails += '</ul>';
        this.fetchDataDevice(device)

        let dateArray = this.getDateList(device.json.createdAt*1000,moment().unix()*1000, 'hour')
        dateArray.reverse()
        this.slider.data = dateArray
        let slider = this.$refs['slider']
        slider.setIndex([0,1])
      })
      .catch((e) => {
        this.$log.debug('Failed to load device')
        this.$log.error(e)
        this.loading = false
      })
    },
    fetchDataDevice (device) {
      let keys = Object.keys(device.json.streams);
      // console.log(keys);
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
      // d.sort(function(a, b){return a.timestamp < b.timestamp});
      this.streamChartLabels = []
      for (var i = 0; i < d.length; i++) {
        let s = d[i];
        if(i == 0) {
          this.deviceDataTime = this.formatDate(s.timestamp * 1000);
        }
        this.streamChartLabels.push((new Date(s.timestamp * 1000)).toUTCString());
        this.dictDevice.push(s.channels[channel]);
      }
      // let context = this
      this.realStreamChartLabels = this.streamChartLabels
      // .filter(function(item, pos) {
      //     return context.streamChartLabels.indexOf(item) == pos;
      // })
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
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        .then((streams) => {
          if(streams.length > 0) {
            let stream = this.selectedDev.json.streams[this.selectedStream]
            // console.log(streams[0].channels)
            // console.log(streams)
            if(stream.dynamic) {
              let chs = streams[0].channels
              let keys = Object.keys(chs);
              this.optionsChannel = [];
              for (var i = 0; i < keys.length; i++) {
                if(chs[keys[i]] * 1) {
                  if(this.optionsChannel == 0) {
                    this.optionsChannel.push({ value: null,text: 'Please select a Channel' });
                  }
                  this.optionsChannel.push({ value: keys[i],text: keys[i] });
                }
              }
            }
            streams.reverse()
            context.selectedStreamData = streams;
            context.realtimeDataLabels = streams;
          }
        })
        .catch(function(e) {
          // console.log(e)
          // console.log(JSON.stringify(e))
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
      console.log(this.dataChartDevice.length)
      this.realData = this.dataChartDevice
    },
    getNode () {
      let name = "memosa-nodes"
      return this.$raptor.Tree().list().then((list) => {
        const res = list.filter((n) => n.name === name)
        if (res.length === 0) {
          // console.log("Creating new `%s` node", name)
          return this.$raptor.Tree().create({name})
        }
        // console.log("Found `%s` node", name)
        return Promise.resolve(res[0])
      })
    },
    addDeviceNode (parentNode, device) {
      // console.log("Adding to group %s device %s (id:%s)", parentNode.name, device.name, device.id)
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
      // console.log(val)
      if(val == this.selectedDisplayParam) {
        return
      }
      if(val == null) {
        this.selectedDisplayParam = 'hour';
      }
      this.selectedDisplayParam = val;
      if(this.selectedStreamData && this.selectedChannel) {
        let dateArray = this.getDateList(this.selectedDev.json.createdAt*1000,moment().unix()*1000, this.selectedDisplayParam)
        dateArray.reverse()
        let slider = this.$refs['slider']
        this.slider.data = dateArray
        // console.log(this.slider.data)
        slider.setIndex([0,1])
        // console.log(this.slider.data)
        this.searchData(this.selectedDev.json.streams[this.selectedStream], this.slider.data[1], this.slider.data[0])
        // this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData, val, this.selectedChannel);
        // this.changeStreamData();
      }
    },
    onChangeOptionChannel (evt) {
      let val = evt.target.value;
      this.dictDevice = [];
      if(this.selectedStreamData) {
        if(this.selectedDisplayParam == null) {
          this.selectedDisplayParam = 'hour'
        }
        let dateArray = this.getDateList(this.selectedDev.json.createdAt*1000,moment().unix()*1000, this.selectedDisplayParam)
        dateArray.reverse()
        this.slider.data = dateArray
        // let slider = this.$refs['slider']
        // slider.setIndex([1,0])
        this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData,this.selectedDisplayParam,val);
        this.changeStreamData();
      }
    },

    // search stream data for device
    searchDataOld (stream, startDate, endDate) {
      if(startDate == undefined || startDate == null ) {
        startDate = 0
      } else {
        // startDate = startDate+':00'
        startDate = moment(startDate).format('x');
      }
      if(endDate == undefined || endDate == null) {
        endDate = currentDate.format('x')
      } else {
        // endDate = endDate+':00'
        endDate = moment(endDate).format('x');
      }
      // "timestamp":{"between":[1510152092358,1510152094358]}
      let i = 0
      let pageNumber = 1
      while(i < pageNumber) {
        let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber-1, size:500,sort:"createdAt,DESC"}
        // console.log(query)
        this.$raptor.Stream().search(stream, query)
        .then((stream) => {
          // console.log(stream.length)
          this.selectedStreamData = stream;
          let temp = this.selectedChannel
          // console.log(temp)
          this.selectedChannel = null;
          this.selectedChannel = temp
          this.onChangeOptionChannel({target: {value: this.selectedChannel}})
          // let dateArray = this.getDateList(this.selectedDev.json.createdAt*1000,moment().unix()*1000, 'hour')
          // dateArray.reverse()
          // this.slider.data = dateArray
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
        i = i + 1
      }
    },

    // search stream data for device
    searchData (stream, startDate, endDate) {
      if(startDate == undefined || startDate == null ) {
        startDate = 0
      } else {
        // startDate = startDate+':00'
        startDate = moment(startDate).format('x');
      }
      if(endDate == undefined || endDate == null) {
        endDate = currentDate.format('x')
      } else {
        // endDate = endDate+':00'
        endDate = moment(endDate).format('x');
      }
      // "timestamp":{"between":[1510152092358,1510152094358]}
      let pageNumber = 0
      this.selectedStreamData = []
        let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
        // console.log(query)
        // console.log(stream)
        this.loopOverStreamPagination (stream, query, pageNumber, startDate, endDate)
    },
    searchDataApi(stream, query, callback) {
      console.log(query)
      console.log(stream)
      this.$raptor.Stream().search(stream, query)
      .then((stream) => {
        // console.log(stream.length)
        callback(stream)
      })
      .catch((e) => {
        this.$log.debug('Failed to load device')
        this.$log.error(e)
        this.loading = false
      })
    },
    loopOverStreamPagination (stream, query, pageNumber, startDate, endDate) {
      let context = this
      this.searchDataApi(stream, query, function (streams) {
        // console.log(streams[0])
        // console.log(streams[0].timestamp * 1000)
        // console.log(endDate)
        // console.log((streams[0].timestamp * 1000) > endDate)
        if(streams.length > 0 && (streams[0].timestamp * 1000) < endDate) {
          for (var i = 0; i < streams.length; i++) {
            context.selectedStreamData.push(streams[i])
          }
          pageNumber = pageNumber + 1
          let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
          context.loopOverStreamPagination(stream, query, pageNumber, startDate, endDate)
        } else {
          for (var i = 0; i < streams.length; i++) {
            context.selectedStreamData.push(streams[i])
          }
          let temp = context.selectedChannel
          // console.log(temp)
          context.selectedChannel = null;
          context.selectedChannel = temp
          context.onChangeOptionChannel({target: {value: context.selectedChannel}})
          // let dateArray = this.getDateList(this.selectedDev.json.createdAt*1000,moment().unix()*1000, 'hour')
          // dateArray.reverse()
          // this.slider.data = dateArray
        }
      })
    },

    // subscription and unsubscription
    subscribeStream (stream) {
      var context = this;
      this.$raptor.Stream().subscribe(stream, function(msg) {
        console.log(msg)
        context.selectedStreamData.push(msg.record);
        console.log(context.selectedStreamData)
        if(context.selectedStreamData.length > 100) {
          context.selectedStreamData.shift()
        }
        context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,'minutes',context.selectedChannel);
        if(context.isSliderDragged) {
          context.sliderDragEnd()
        }
        context.changeStreamData();
        // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
        //   return
        // }
        // console.log(context.selectedStreamData)
        // console.log(context.selectedStreamData.length)
        context.loading = false;
      });
    },
    unsubscribeStream (stream) {
      var context = this;
      this.$raptor.Stream().unsubscribe(stream, function(msg) {
        console.log(msg)
      });
    },

    // visualization of data
    getDateList (dateStart, dateEnd, type) {
      dateStart = moment(dateStart);
      dateEnd = moment(dateEnd);
      let months = []
      let format = 'YYYY-MM-DD'
      if(type == 'realhour') {
        type = 'hour'
      }
      while (dateStart.isBefore(dateEnd)) {
        if(type == 'month') {
          format = 'YYYY-MM'
        } else if (type == 'day') {
          format = 'YYYY-MM-DD'
        } else if (type == 'hour') {
          format = 'YYYY-MM-DDTHH:00'
        } else if (type == 'realtime') {
          format = 'YYYY-MM-DDTHH:00'
        } else {
          format = 'YYYY-MM-DDTHH:00'
        }
        months.push(dateStart.format(format));
        dateStart.add(1,type);
      }
      months.push(moment().format('YYYY-MM-DDTHH:00'))
      return months
    },

    // slider events
    sliderDragEnd () {
      // console.log("drag end")
      this.searchData(this.selectedDev.json.streams[this.selectedStream], this.slider.value[1], this.slider.value[0])
      // if(this.realData && this.realStreamChartLabels) {
      //   this.isSliderDragging = false
      //   console.log(this.slider.value)
      //   let valuesToShowMin = (this.slider.value[0] / 100) * this.realData.length
      //   let valuesToShowMax = (this.slider.value[1] / 100) * this.realData.length
      //   valuesToShowMin = (valuesToShowMin != 0) ? valuesToShowMin : 0
      //   valuesToShowMax = (valuesToShowMax != this.realData.length) ? valuesToShowMax : this.realData.length

      //   let labelsToShowMin = (this.slider.value[0] / 100) * this.realStreamChartLabels.length
      //   let labelsToShowMax = (this.slider.value[1] / 100) * this.realStreamChartLabels.length
      //   labelsToShowMin = (labelsToShowMin != 0) ? labelsToShowMin : 0
      //   labelsToShowMax = (labelsToShowMax != this.realStreamChartLabels.length) ? labelsToShowMax : this.realStreamChartLabels.length

      //   console.log("length: %s, min: `%s`, max: `%s`", this.realData.length, valuesToShowMin, valuesToShowMax)
      //   console.log("length: %s, min: `%s`, max: `%s`", this.realStreamChartLabels.length, labelsToShowMin, labelsToShowMax)

      //   this.dataChartDevice = this.realData.slice(valuesToShowMin, valuesToShowMax)
      //   this.streamChartLabels = this.realStreamChartLabels.slice(labelsToShowMin, labelsToShowMax)

      //   if(this.slider.value[0] >= 0 || this.slider.value[1] <= 100) {
      //     this.isSliderDragged = true
      //   } else {
      //     this.isSliderDragged = false
      //   }
      // }
      // console.log(this.dataChartDevice)
      // console.log(this.streamChartLabels)
    },
    sliderDragStart () {
      this.isSliderDragging = true
      // console.log("drag start")
    },
    sliderValueChanged () {
      if(!this.isSliderDragging) {
        console.log("slider value changed")
        this.sliderDragEnd()
        if(this.slider.value[0] >= 0 || this.slider.value[1] <= 100) {
          this.isSliderDragged = true
        } else {
          this.isSliderDragged = false
        }
      }
    },

    // dashboard related methods
    extractChartDataDev (d) {
      for (var i = 0, len = d.length; i < len; i++) {
        let s = d[i]
        let sDate = this.formatDate(s.json.createdAt * 1000).split(' ')[0]
        this.$data.dictChartDevices[sDate] = this.$data.dictChartDevices[sDate] ? this.$data.dictChartDevices[sDate] + 1 : 1;
      }
    },
    fetchData () {
      this.$raptor.Inventory().list()
      .then((list) => {
        // this.$log.debug('Loaded %s device list', list.length);
          console.log(list);
          this.extractChartDataDev(list);
          this.$data.labelChartDevices = Object.keys(this.$data.dictChartDevices); // getting labels
          this.$data.devices = list;
          this.totalNoOfDevices = list.length;
          list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
          this.changeDataDevicesChart();
        })
      .catch(function(e) {
        console.log(e)
        console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          this.$raptor.Auth().logout();
          this.$router.push("/pages/login");
        }
      });
      // this.fetchDevices(this.selectedDevice);
    },
    changeDataDevicesChart: function() {
      let arr = Array();
      for (var i = 0; i < this.labelChartDevices.length; i++) {
        let s = this.labelChartDevices[i];
        arr.push(this.dictChartDevices[s]);
      }
      this.dataChartDevices = arr;
    },
    onChangeDevice (evt) {
      let val = evt.target.value;
      // if(this.selectedStream != null && this.selectedDev != null) {
      //   this.unsubscribeStream(this.selectedDev.json.streams[this.selectedStream]);
      // }
      for (var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].id == val){
          let details = this.devices[i];
          this.selectedDev = details;
          this.deviceName = details.name;
          this.getSingleDevice(details);
          this.selectedDeviceDetails = '<ul>';
          this.selectedDeviceDetails += '<li><strong>Name:</strong>     ' + details.name + '</li>';
          this.selectedDeviceDetails += '<li><strong>id:</strong>       ' + details.id + '</li>';
          this.selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(details.json.createdAt*1000) + '</li>';
          this.selectedDeviceDetails += '</ul>';
        }
      }
    },
    getSingleDevice (device) {
      if(device) {
        let keys = Object.keys(device.json.streams);
        console.log(keys);
        this.optionsStreams = [];
        this.optionsStreams.push({ value: null,text: 'Please select a stream' });
        for (var i = 0; i < keys.length; i++) {
          this.optionsStreams.push({ value: keys[i],text: keys[i] });
        }
        this.selectedStream = keys[0];
        this.dataSubscribed = false;
      }
    },
  }
}
</script>
