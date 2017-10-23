<template>
  <div class="wrapper">
    <div class="animated fadeIn">
      <p>
        <!-- <button @click="addWidget">Add Widget</button> -->
        <b-button type="button" variant="success" @click="infoModal = true">Add Widget</b-button>
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
              <div v-if="wid.chart == 'bar'">
                <bar-chart class="chart-wrapper" :chartData="wid.data"/>
              </div>
              <div v-if="wid.chart == 'polar'">
                <polar-area-chart class="chart-wrapper" :chartData="wid.data"/>
              </div>
              <div v-else-if="wid.chart == 'line'">
                <line-chart class="chart-wrapper" :chartData="wid.data"/>
              </div>
              <div v-else-if="wid.chart == 'pie'">
                <pie-chart class="chart-wrapper" :chartData="wid.data"/>
              </div>
              <div v-else-if="wid.chart == 'radar'">
                <radar-chart class="chart-wrapper" :chartData="wid.data"/>
              </div>
              <div v-else-if="wid.chart == 'doughnut'">
                <doughnut-chart class="chart-wrapper" :chartData="wid.data"/>
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
import BarChart from './charts/BarChart'
import LineChart from './charts/LineChart'
import DoughnutChart from './charts/DoughnutChart'
import RadarChart from './charts/RadarChart'
import PieChart from './charts/PieChart'
import PolarAreaChart from './charts/PolarAreaChart'

import VueGridLayout from 'vue-grid-layout'
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/remove'

Vue.component('icon', Icon)

var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;

export default {
  name: 'dashboard',
  components: {
    DragableView,
    BarChart,
    LineChart,
    DoughnutChart,
    RadarChart,
    PieChart,
    PolarAreaChart,
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
      selectedTitle: null,
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
    this.fetchData();
    this.fetchDevicesData();
  },
  methods: {
    fetchData () {
      let userId = this.$raptor.Auth().getUser().uuid
      // let dataInFile = readFile()
      // console.log(dataInFile)
      let json = { dashboard: [
          {
            title:"Pie",
            chart: "pie",
            data:{
              device: "9de8e803-04d6-4de6-9133-e144bc88e410",
              stream: "locations",
              channel: "lat"
            }
          },
          {
            title:"Line",
            chart: "line",
            data:{
              device: "0a3614c5-9762-4751-ad08-c77354a86e57",
              stream: "obd",
              channel: "speed"
            }
          },
          {
            title:"Polar",
            chart: "polar",
            data:{
              device: "4750ada9-a3aa-4d98-9612-6ca8ea7654be",
              stream: "stats",
              channel: "distance"
            }
          },
          {
            title:"Bar",
            chart: "bar",
            data:{
              device: "ab9bed83-629a-4d64-91e9-c5c816f353d5",
              stream: "wearable",
              channel: "hr"
            }
          },
          ]}
        // { users: [
        // {
        //   user: "ac8b3312-0648-432b-8d9d-faacb7b2875d",
        // },
        // ]}
        let context = this
        let pathDashboard = '/users/'+userId+'/dashboard'
        this.readDataFirebase('/users/', function(snapshot) {
          if(snapshot.hasChild(userId)) {
            console.log(snapshot.val())
            if(snapshot.child(userId).hasChild('dashboard')) {
              let arr = snapshot.child(userId).child('dashboard').val()
              context.loadDefaultCharts(arr)
            }
          } else {
            context.$dbFirebase.ref('users/' + userId).set(json);
            context.loadDefaultCharts(json.dashboard)
          }
        })
    },
    fetchDevicesData () {
      this.$raptor.Inventory().list()
      .then((list) => {
        // this.$log.debug('Loaded %s device list', list.length);
          // console.log(list);
          this.$data.devices = list;
          list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
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
    loadDefaultCharts(dasboardWidgets) {
      let arr = []
      for (var j = 0; j < dasboardWidgets.length; j++) {
        let widget = {x:(j%3)*4,y:(j%3)*7,w:4,h:7,i:j+"", title:dasboardWidgets[j].title, chart: dasboardWidgets[j].chart, data:dasboardWidgets[j].data}
        arr.push(widget)
      }
      this.widgets = arr
    },
    addWidget(widData) {
      this.widgets.push({
        x:0,
        y:0,
        w:4,
        h:7,
        i:this.widgets.length+1,
        title:widData.title,
        chart: widData.chart,
        data:{
          device: widData.data.device,
          stream: widData.data.stream,
          channel: widData.data.channel
        }
      })
      this.selectedDevice = null
      this.selectedStream = null
      this.selectedChannel = null
      this.selectedChart = null
      this.selectedTitle = null
      let userId = this.$raptor.Auth().getUser().uuid
      let pathDashboard = '/users/'+userId+'/dashboard'
      var context = this
      this.readDataFirebase(pathDashboard, function(snapshot) {
        console.log(snapshot.val())
        console.log(snapshot.key)
        if(snapshot.key == 'dashboard') {
          let widgets = snapshot.val()
          console.log(widgets)
          widgets.push(widData)
          context.$dbFirebase.ref(pathDashboard).set(widgets);
        }
      })
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
            this.selectedStream = keys[0];
            this.selectedStreamDetail = this.selectedDeviceDetail.json.streams[keys[0]]
          }
        }
      }
    },
    onChangeOptionStream (evt) {
      let val = evt.target.value;
      if(this.selectedDeviceDetail) {
        let stream = this.selectedDeviceDetail.json.streams[val];
        console.log(stream)
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
      let widData = {
        chart: this.selectedChart,
        title: this.selectedTitle,
        data: {
          device: this.selectedDevice,
          stream: this.selectedStream,
          channel: this.selectedChannel
        }
      }
      this.addWidget(widData);
    },
    onRemoveWidgetButtonClick (widget) {
      let index = this.widgets.indexOf(widget)
      this.widgets.splice(index, 1)
    },
    // firebase functions
    readDataFirebase(path, fun) {
      return this.$dbFirebase.ref(path).once('value').then(fun);
    }
  }
}
</script>
