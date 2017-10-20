<template>
  <div class="wrapper">
    <div class="animated fadeIn">
      <p>
        <button @click="addWidget">
          Add Widget
        </button>
        <b-button type="button" variant="success" @click="infoModal = true">Launch info modal</b-button>
      </p>

      <grid-layout :layout.sync="widgets" :col-num="12" :row-height="30" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true" >
          <grid-item v-for="wid in widgets" :key="wid.i" :minH="6" :minW="3" :maxH="12" :maxW="9" :x.sync="wid.x" :y.sync="wid.y" :w.sync="wid.w" :h.sync="wid.h" :i="wid.i">
              <div class="bg-primary">
                <div class="float-right">
                  <button type="button" i="wid.i" class="btn btn-link btn-sm" @click="(ev) => { onRemoveWidgetButtonClick(ev, wid) }">
                    <icon name="remove" scale="2" color="red"></icon>
                  </button>
                </div>
                <div class="card-body pb-0">
                  <p>{{wid.title}}</p>
                </div>
                <b-card>
                  <div v-if="wid.chart == 'barchart'">
                    <dragable-view class="chart-wrapper" :chartData="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'linechart'">
                    <dragable-view class="chart-wrapper" :chartData="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'piechart'">
                    <dragable-view class="chart-wrapper" :chartData="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'chart'">
                    <dragable-view class="chart-wrapper" :chartData="wid.data" :labels="wid.label"/>
                  </div>
                </b-card>
              </div>
          </grid-item>
      </grid-layout>
    </div>

    <b-modal title="Modal title" class="modal-info" v-model="infoModal" @ok="onAddChartButtonClick">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      <b-form-fieldset description="Please select a device" label="Device" :horizontal="false">
        <!-- <select class="form-control" @change="onChangeDevice">
          <option v-for="dev in listOfDevicesForSelectOptions" v-bind:value="dev.value">{{dev.text}}</option>
        </select> -->
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeDevice" v-model="selectedDevice" :options="listOfDevicesForSelectOptions" />
        </div>
      </b-form-fieldset>
      <b-form-fieldset description="Please select a stream" label="Stream" :horizontal="false">
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
        </div>
      </b-form-fieldset>
      <b-form-fieldset description="Please select a channel" label="Channel" :horizontal="false">
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionChannel" v-model="selectedChannel" :options="optionsChannel" />
        </div>
      </b-form-fieldset>

      <!-- Select chart type to show -->
      <b-form-fieldset description="Please select a chart you want to add" label="Chart Type" :horizontal="false">
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionChart" v-model="selectedChart" :options="optionsChart" />
        </div>
      </b-form-fieldset>
    </b-modal>

  </div>
</template>

<script>
  import DragableView from './DragableView'
  import VueGridLayout from 'vue-grid-layout'
  import Vue from 'vue'
  import Icon from 'vue-awesome/components/Icon'
  import 'vue-awesome/icons/remove'

  Vue.component('icon', Icon)

  var GridLayout = VueGridLayout.GridLayout;
  var GridItem = VueGridLayout.GridItem;
  // var fs = require('fs');

export default {
  name: 'dashboard',
  components: {
    DragableView,
    GridLayout,
    GridItem,
    Icon,
  },
  data () {
    return {
      // gridContainer: null,
      // grid: null,
      widgets: [],
      // label: [],
      // dictUser: {},
      // dictDevice: [],
      // dataChartUser: [10, 39, 10, 40, 39, 0, 0],
      // chart: null,
      dbFile: "RaptorBoxUsersDashboard.json",
      infoModal: false,
      listOfDevicesForSelectOptions : [{ value: null, text: 'Please select a device' }],
      optionsStreams: [{ value: null, text: 'Please select a stream' }],
      optionsChannel: [{ value: null, text: 'Please select a channel' }],
      optionsChart: [
        { value: null,        text: 'Please select a chart' },
        { value: 'line',      text: 'Line Chart' },
        { value: 'bar',       text: 'Bar Chart' },
        { value: 'pie',       text: 'Pie Chart' },
        { value: 'polar',     text: 'Polar Chart' },
        { value: 'radar',     text: 'Radar Chart' },
        { value: 'doughnut',  text: 'Doughnut Chart' },
      ],
      selectedDevice: null,
      selectedStream : null,
      selectedChannel: null,
      selectedChart: null,
      selectedDeviceDetail : null,
      selectedStreamDetail: null,
      devices: null,
      db: null,
    }
  },
  mounted () {
    // this.loadDefaultCharts();
    this.fetchData();
    this.fetchDevicesData();
  },
  methods: {
    fetchData () {
      // let dataInFile = readFile()
      // console.log(dataInFile)
      let json = { users: [
        {
          user: "ac8b3312-0648-432b-8d9d-faacb7b2875d",
          dashboard: [
            {
              title:"Total Device",
              chart: "bar",
              data:{
                device: "",
                stream: "stats",
                channel: ""
              }
            },
            {
              title:"Total Device",
              chart: "line",
              data:{
                device: "",
                stream: "stats",
                channel: ""
              }
            },
            {
              title:"Total Device",
              chart: "pie",
              data:{
                device: "",
                stream: "stats",
                channel: ""
              }
            },
            {
              title:"Total Device",
              chart: "bar",
              data:{
                device: "",
                stream: "stats",
                channel: ""
              }
            },
          ]
        },
      ]}
      this.writeInFile(json)
    },
    fetchDevicesData () {
      this.$raptor.Inventory().list()
      .then((list) => {
        // this.$log.debug('Loaded %s device list', list.length);
          // console.log(list);
          this.$data.label = Object.keys(this.$data.dictUser);
          this.$data.devices = list;
          list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
          // this.changeData();
          // this.chart = "barchart"
        })
      .catch(function(e) {
        // console.log(e)
        // console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          context.$raptor.Auth().logout();
          context.$router.push("/pages/login");
        }
      });
    },
    loadDefaultCharts() {
      this.widgets.push({x:0,y:0,w:4,h:7,i:"0", title:"Total Device", chart: "barchart", data:{device: this.selectedDevice, stream: this.selectedStream, channel: this.selectedChannel}})
      this.widgets.push({x:4,y:0,w:4,h:7,i:"1", title:"Total Device", chart: "linechart", data:{device: this.selectedDevice, stream: this.selectedStream, channel: this.selectedChannel}})
      this.widgets.push({x:8,y:0,w:4,h:7,i:"2", title:"Total Device", chart: "piechart", data:{device: this.selectedDevice, stream: this.selectedStream, channel: this.selectedChannel}})
      this.widgets.push({x:0,y:7,w:4,h:7,i:"3", title:"Total Device", chart: "chart", data:{device: this.selectedDevice, stream: this.selectedStream, channel: this.selectedChannel}})
    },
    addWidget(device, stream, channel) {
      this.widgets.push({x:0,y:0,w:4,h:7,i:this.widgets.length+1, title:"Device "+(this.widgets.length+1), chart: "chart", data:{device: device, stream: stream, channel: channel}})
      this.selectedDevice = null
      this.selectedStream = null
      this.selectedChannel = null
    },
    // changeData: function() {
    //   let arr = Array();
    //   for (var i = 0; i < this.label.length; i++) {
    //     let s = this.label[i];
    //     arr.push(this.dictUser[s]);
    //   }
    //   this.dataChartUser = arr;
    // },
    onChangeDevice (evt) {
      let val = evt.target.value;
      for (var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].id == val){
          let details = this.devices[i];
          this.selectedDeviceDetail = details;
          if(this.selectedDeviceDetail) {
            let keys = Object.keys(this.selectedDeviceDetail.json.streams);
            // console.log(keys);
            this.optionsStreams = [];
            this.optionsStreams.push({ value: null,text: 'Please select a stream' });
            for (var j = 0; j < keys.length; j++) {
              this.optionsStreams.push({ value: keys[j],text: keys[j] });
            }
            // this.selectedStream = keys[0];
            // this.selectedStreamDetail = this.selectedDeviceDetail.json.streams[keys[0]]
          }
        }
      }
    },
    onChangeOptionStream (evt) {
      let val = evt.target.value;
      if(this.selectedDeviceDetail) {
        let stream = this.selectedDeviceDetail.json.streams[val];
        this.selectedStreamDetail = stream
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
      }
    },
    onChangeOptionChannel (evt) {
    },
    onChangeOptionChart (evt) {
    },
    onAddChartButtonClick (evt) {
      console.log("device: " + this.selectedDevice + " stream: " + this.selectedStream + " channel: " + this.selectedChannel + " chart: " + this.selectedChart)
      this.infoModal = false
      this.addWidget(this.selectedDevice, this.selectedStream, this.selectedChannel);
    },
    onRemoveWidgetButtonClick (widget) {
      let index = this.widgets.indexOf(widget)
      this.widgets.splice(index, 1)
    },
    // create or open db for dashboard setting
    writeInFile (jsonData) {
      // const adapter = new FileSync('RaptorBoxUsersDashboard.json')
      // this.db = low(adapter)
      // this.db.defaults({ users: [], dashboard: [] }).write()
      // fs.writeFile(this.dbFile, jsonData, function(err) {
      //   if(err) {
      //     return console.log(err);
      //   }
      // });
    },
    readFile () {
      // fs.readFile(this.dbFile, function(err, obj) {
      //   if(err) {
      //     return console.log(err);
      //   }
      //   console.log(obj)
      //   return JSON.parse(obj);
      // });
    }
  }
}
</script>
