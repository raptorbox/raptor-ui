<template>
  <div class="wrapper">
    <div class="animated fadeIn">
      <p>
        <!-- <button @click="addWidget">Add Widget</button> -->
        <b-button type="button" variant="success" @click="addChartForDevicesCount">Add Device Count Chart</b-button>
        <b-button type="button" variant="success" @click="singleDataModal = true">Add Widget</b-button>
        <b-button type="button" variant="success" @click="multipleDataModal = true">Add Mix Chart Widget</b-button>
      </p>
      <div class="card-columns cols-3">
        <div class="container" v-dragula="widgets" drake="first">
          <div v-for="wid in widgets">
            <!-- <div class="bg-primary"> -->
              <b-card show-header>
                <div slot="header">
                  <div class="float-right">
                    <button type="button" i="wid.i" class="btn btn-link" @click="(ev) => { onRemoveWidgetButtonClick(ev, wid) }">
                      <icon name="remove" scale="2" color="red"></icon>
                    </button>
                  </div>
                  <div class="pb-0">
                    <h5>{{wid.title}}</h5>
                  </div>
                </div>
                <div class="chart-wrapper" v-if="wid.chart == 'bar'">
                  <bar-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" v-else-if="wid.chart == 'polar'">
                  <polar-area-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" style="position: relative; height: 25vh;" v-else-if="wid.chart == 'line' && wid.data">
                  <line-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" v-else-if="wid.chart == 'pie'">
                  <pie-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" v-else-if="wid.chart == 'radar'">
                  <radar-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" v-else-if="wid.chart == 'doughnut'">
                  <doughnut-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" v-if="wid.data == null">
                  <line-chart-report />
                </div>
              </b-card>
            <!-- </div> -->
          </div>
        </div>
      </div>
    </div>

    <b-modal title="Add Widget" class="modal-info" v-model="singleDataModal" @ok="onAddChartButtonClick">
      <b-form-fieldset description="Please enter a widget title" label="Title" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="selectedTitle"></b-form-input>
      </b-form-fieldset>
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

    <b-modal title="Add Multuiple Data source Widget" size="lg" class="modal-info" v-model="multipleDataModal" @ok="onAddMixChart">
      <b-form-fieldset description="Please enter a widget title" label="Title" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="selectedTitle"></b-form-input>
      </b-form-fieldset>
      <b-button class="btn btn-primary" block @click="onCreateChannelButton">Add Source</b-button>
      <div v-for="source in tableDataSource" id="stream">
        <div class="row row-fluid">
          <div class="col-md-4" style="padding: 10px">
            <b-form-fieldset description="Please select a device" label="Device" :horizontal="false">
              <b-form-select variant="outline-secondary" class="mr-3" @change.native="(ev) => {onChangeDevice(ev, source)}" v-model="source.device" :options="listOfDevicesForSelectOptions" />
            </b-form-fieldset>
          </div>

          <div class="col-md-4" style="padding: 10px">
            <b-form-fieldset description="Please select a stream" label="Stream" :horizontal="false">
              <b-form-select variant="outline-secondary" class="mr-3" @change.native="(ev) => {onChangeOptionStream(ev, source)}" v-model="source.stream" :options="source.optionsStreams" />
            </b-form-fieldset>
          </div>
          
          <div class="col-md-4" style="padding: 10px">
            <b-form-fieldset description="Please select a channel" label="Channel" :horizontal="false">
              <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeOptionChannel" v-model="source.channel" :options="source.optionsChannel" />
            </b-form-fieldset>
          </div>
        </div>
      </div>
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
import LineChartReport from './charts/LineChartReport'

import VueGridLayout from 'vue-grid-layout'
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/remove'
import { Vue2Dragula } from 'vue2-dragula'

Vue.use(Vue2Dragula, {
  logging: {
    service: false
  }
});

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
    LineChartReport,
    GridLayout,
    GridItem,
    Icon,
  },
  data () {
    return {
      widgets: [],
      singleDataModal: false,
      multipleDataModal: false,
      listOfDevicesForSelectOptions : [{ value: null, text: 'Please select a device' }],
      optionsStreams: [{ value: null, text: 'Please select a stream' }],
      optionsChannel: [{ value: null, text: 'Please select a channel' }],
      optionsChart: [
      { value: null,        text: 'Please select a chart' },
      { value: 'line',      text: 'Line Chart' },
      { value: 'bar',       text: 'Bar Chart' },
      { value: 'pie',       text: 'Pie Chart'               , disabled: true },
      { value: 'polar',     text: 'Polar Chart'             , disabled: true },
      { value: 'radar',     text: 'Radar Chart'             , disabled: true },
      { value: 'doughnut',  text: 'Doughnut Chart'          , disabled: true },
      // { value: 'bubble',    text: 'Bubble Chart' },
      // { value: 'scatter',   text: 'Scatter Chart' },
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
      // for multiple data sources in charts
      tableDataSource: []
    }
  },
  mounted () {
    this.fetchData();
    this.fetchDevicesData();
    // for default values
    this.populateMultipleDataSourceFields();
  },
  methods: {
    fetchData () {
      let userId = this.$raptor.Auth().getUser().uuid
      let json = { dashboard: [
          {
            x:0,
            y:0,
            w:6,
            h:11,
            i:0,
            title:"Report",
            chart: "line"
          },
          {
            x:6,
            y:0,
            w:6,
            h:11,
            i:1,
            title:"Line",
            chart: "line",
            data:{
              device: "0a3614c5-9762-4751-ad08-c77354a86e57",
              stream: "obd",
              channel: "speed"
            }
          },
          {
            x:0,
            y:11,
            w:6,
            h:11,
            i:2,
            title:"Line",
            chart: "Line",
            data:{
              device: "0a3614c5-9762-4751-ad08-c77354a86e57",
              stream: "obd",
              channel: "speed"
            }
          },
          {
            x:6,
            y:11,
            w:4,
            h:11,
            i:3,
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
    populateMultipleDataSourceFields() {
      let obj = {
        number: 0,
        device: null,
        stream: null,
        channel: null,
        optionsStreams: [],
        optionsChannel: []
      }
      this.tableDataSource.push(obj)
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
      // let arr = []
      // for (var j = 0; j < dasboardWidgets.length; j++) {
      //   let widget = {x:(j%2)*5,y:(j%2)*11,w:5,h:11,i:j+"", title:dasboardWidgets[j].title, chart: dasboardWidgets[j].chart, data:dasboardWidgets[j].data}
      //   arr.push(widget)
      // }
      this.widgets = dasboardWidgets
    },
    addWidget(widData) {
      let widget = {
        x:(this.widgets.length%2)*6,
        y:(this.widgets.length%2)*11,
        w:6,
        h:11,
        i:this.widgets.length+1,
        title:widData.title,
        chart: widData.chart,
        data:{
          device: widData.data.device,
          stream: widData.data.stream,
          channel: widData.data.channel
        }
      }
      this.widgets.push(widget)
      this.selectedDevice = null
      this.selectedStream = null
      this.selectedChannel = null
      this.selectedChart = null
      this.selectedTitle = null
      this.writeToFirebase(widget)
    },
    onChangeDevice (evt, source) {
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
            if(source) {
              for (var j = 0; j < this.tableDataSource.length; j++) {
                if(source.number == this.tableDataSource[j].number) {
                  this.tableDataSource[j].optionsStreams = this.optionsStreams
                  this.optionsStreams = []
                }
              }
            }
            // this.selectedStream = keys[0];
            // this.selectedStreamDetail = this.selectedDeviceDetail.json.streams[keys[0]]
          }
        }
      }
    },
    onChangeOptionStream (evt, source) {
      let val = evt.target.value;
      if(val) {
        console.log(val)
        this.selectedStream = val;
        let stream = this.selectedDeviceDetail.json.streams[val];
        if(stream) {
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
          if(source) {
            for (var i = 0; i < this.tableDataSource.length; i++) {
              if(source.number == this.tableDataSource[i].number) {
                this.tableDataSource[i].optionsChannel = this.optionsChannel
                this.optionsChannel = []
              }
            }
          }
        }
      }
    },
    onChangeOptionChannel (evt) {
    },
    onChangeOptionChart (evt) {
    },
    addChartForDevicesCount () {
      let widget = {
        x:(this.widgets.length%2)*6,
        y:(this.widgets.length%2)*11,
        w:6,
        h:11,
        i:this.widgets.length+1,
        title: 'Report',
        chart: 'line'
      }
      this.widgets.push(widget)
      this.writeToFirebase(widget)
    },
    // button click for modals
    onAddChartButtonClick (evt) {
      console.log("device: " + this.selectedDevice + " stream: " + this.selectedStream + " channel: " + this.selectedChannel + " chart: " + this.selectedChart)
      this.singleDataModal = false
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
      let userId = this.$raptor.Auth().getUser().uuid
      var context = this
      this.readDataFirebase('/users/'+userId, function(snapshot) {
        if(snapshot.hasChild('dashboard')) {
          let arr = snapshot.child('dashboard').val()
          let index = arr.indexOf(widget)
          arr.splice(index, 1)
          console.log(arr)
          context.$dbFirebase.ref('users/' + userId).set({dashboard: arr});
        }
      })
    },
    onCreateChannelButton () {
      if(this.tableDataSource.length < 5) {
        let obj = {
          number: this.tableDataSource.length+1,
          device: null,
          stream: null,
          channel: null,
          optionsStreams: [],
          optionsChannel: []
        }
        this.tableDataSource.push(obj)
      }
    },
    onAddMixChart() {
      let widget = {
        x:(this.widgets.length%2)*6,
        y:(this.widgets.length%2)*11,
        w:6,
        h:11,
        i:this.widgets.length+1,
        chart: this.selectedChart,
        title: this.selectedTitle,
        data: []
      }
      for (var i = 0; i < this.tableDataSource.length; i++) {
        widget.data.push({
          channel: this.tableDataSource[i].channel,
          stream: this.tableDataSource[i].stream,
          device: this.tableDataSource[i].device
        })
      }
      // console.log(widget)
      this.widgets.push(widget)
      this.selectedChart = null
      this.selectedTitle = null
      this.tableDataSource = []
      this.populateMultipleDataSourceFields();
      this.writeToFirebase(widget)
    },
    // firebase functions
    readDataFirebase(path, fun) {
      return this.$dbFirebase.ref(path).once('value').then(fun);
    },
    writeToFirebase(widget) {
      let userId = this.$raptor.Auth().getUser().uuid
      let pathDashboard = '/users/'+userId+'/dashboard'
      var context = this
      this.readDataFirebase(pathDashboard, function(snapshot) {
        console.log(snapshot.val())
        console.log(snapshot.key)
        if(snapshot.key == 'dashboard') {
          let widgets = snapshot.val()
          console.log(widgets)
          widgets.push(widget)
          context.$dbFirebase.ref(pathDashboard).set(widgets);
        }
      })
    }
  }
}
</script>
