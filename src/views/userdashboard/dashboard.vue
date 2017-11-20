<template>
  <div class="wrapper">
    <div class="animated fadeIn">
      <p>
        <!-- <button @click="addWidget">Add Widget</button> -->
        <b-button type="button" variant="success" @click="addChartForDevicesCount">Add Device Count Chart</b-button>
        <b-button type="button" variant="success" @click="singleDataModal = true">Add Widget</b-button>
        <b-button type="button" variant="success" @click="multipleDataModal = true">Add Mix Chart Widget</b-button>
      </p>
<!-- 
      <div class="card-columns cols-3">
        <div class="container" v-dragula="widgets" drake="first"> 
          <div v-for="wid in widgets" style="resize: both; overflow: auto;">
            <b-card show-header>
              <div slot="header">
                <div class="float-right">
                  <button type="button" i="wid.i" class="btn btn-link" @click="(ev) => { onRemoveWidgetButtonClick(ev, wid) }">
                    <icon name="remove" scale="2" color="red"></icon>
                  </button>
                </div>
                <div class="pb-0" v-on:click.capture="(ev) => { showDetails(ev, wid.data) }">
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
          </div>
        </div>
      </div> -->
    </div>

    <grid-layout :layout="widgets" :col-num="12" :row-height="30" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true" >

        <grid-item v-for="wid in widgets"
                   :x="wid.x"
                   :y="wid.y"
                   :w="wid.w"
                   :h="wid.h"
                   :i="wid.i" :key="wid.i" @resize="resizeEvent" @move="moveEvent" @resized="resizedEvent" @moved="movedEvent" 
                   drag-allow-from=".vue-draggable-handle"
                   drag-ignore-from=".no-drag" class="bg-white">
            <div class="vue-draggable-handle col-md-12">
              <div class="row">
                <div class="col-md-12 bg-light" style="padding:2px; padding-top:4px">
                <div class="float-right">
                  <button type="button" i="wid.i" class="btn btn-link btn-sm" @click="(ev) => { onRemoveWidgetButtonClick(ev, wid) }">
                    <i class="icon-close icons font-2xl d-block" />
                    <!-- <icon name="remove" scale="2" color="red"></icon> -->
                  </button>
                </div>
                <div class="float-left" v-on:click.capture="(ev) => { showDetails(ev, wid.data) }">
                  <h5>{{wid.title}}</h5>
                </div>
                </div>
              </div>
            </div>
            <div class="no-drag">
              <div class="float-right">
                <button type="button" i="wid.i" class="btn btn-link" @click="(ev) => { onFullChartButtonClick(ev, wid) }" >
                  <!-- :to="{ name: 'ChartDetail', params: {widget: wid}}" -->
                  <i class="icon-size-fullscreen icons font-2xl d-block" />
                </button>
              </div>
              <b-card no-header border-variant="light" class="border-0">
                <div :id="'widget'+wid.i" v-if="wid.chart == 'bar'">
                  <!-- :style="{height: wid.h + 'px', width: wid.w + 'px'}" -->
                  <bar-chart :chartData="wid.data"/>
                </div>
                <div :id="'widget'+wid.i" v-else-if="wid.chart == 'polar'">
                   <!-- :style="{height:wid.h+'px', width:wid.w+'px'}" -->
                  <polar-area-chart :chartData="wid.data"/>
                </div>
                <!-- class="chart-wrapper" -->
                <div :id="'widget'+wid.i" v-else-if="wid.chart == 'line' && wid.data" :style="{'max-height': wid.h-50, 'max-width': wid.w}">
                  <line-chart :chartData="wid.data"/>
                </div>
                <div class="chart-wrapper" :id="'widget'+wid.i" v-else-if="wid.chart == 'pie'" :style="{width: ((wid.h*40)-100)+'px'}">
                   <!-- :style="{height:wid.h+'px', width:wid.w+'px'}" -->
                  <pie-chart :chartData="wid.data"/>
                </div>
                <div :id="'widget'+wid.i" v-else-if="wid.chart == 'radar'">
                   <!-- :style="{height:wid.h+'px', width:wid.w+'px'}" -->
                  <radar-chart :chartData="wid.data"/>
                </div>
                <div :id="'widget'+wid.i" v-else-if="wid.chart == 'doughnut'">
                   <!-- :style="{height:wid.h+'px', width:wid.w+'px'}" -->
                  <doughnut-chart :chartData="wid.data"/>
                </div>
                <div :id="'widget'+wid.i" v-if="wid.data == null">
                  <line-chart-report />
                </div>
              </b-card>
            </div>
        </grid-item>
    </grid-layout>

    <!-- single data source widget -->
    <b-modal title="Add Widget" class="modal-info" v-model="singleDataModal" @ok="onAddChartButtonClick" @cancel="clearFields">
      <b-form-fieldset description="Please enter a widget title" label="Title" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="selectedTitle"></b-form-input>
      </b-form-fieldset>
      <!-- <b-form-fieldset description="Please select device type" label="Device Type" :horizontal="false">
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeDeviceType" v-model="selectedDeviceType" :options="listOfDevicesTypeForSelectOptions" />
        </div>
      </b-form-fieldset> -->
      <!-- <b-form-fieldset description="Please select a device" label="Device" :horizontal="false">
        <select class="form-control" @change="onChangeDevice">
          <option v-for="dev in listOfDevicesForSelectOptions" v-bind:value="dev.value">{{dev.text}}</option>
        </select>
        <div class="float-right">
          <b-form-select variant="outline-secondary" class="mr-3" @change.native="onChangeDevice" v-model="selectedDevice" :options="listOfDevicesForSelectOptions" />
        </div>
      </b-form-fieldset> -->
      <b-form-fieldset description="Enter Device id to filter or select from list" label="Device" :horizontal="false">
        <v-autocomplete :items="listOfDevicesForSelectOptions" v-model="selectedDevice" :get-label="getLabel" :component-item='itemAutoTemplate' @update-items="updateItems" :input-attrs="{id: 'v-my-autocomplete'}" @item-clicked="itemClicked" @change="inputChangeEvent">
        </v-autocomplete>
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

    <!-- multi data source widget -->
    <b-modal title="Add Multuiple Data source Widget" size="lg" class="modal-info" v-model="multipleDataModal" @ok="onAddMixChart" @cancel="clearFields">
      <b-form-fieldset description="Please enter a widget title" label="Title" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="selectedTitle"></b-form-input>
      </b-form-fieldset>
      <b-button class="btn btn-primary" block @click="onCreateChannelButton">Add Source</b-button>
      <div v-for="source in tableDataSource" id="stream">
        <div class="row row-fluid">
          <!-- <div class="col-md-3" style="padding: 10px">
            <b-form-fieldset description="Please select device type" label="Device Type" :horizontal="false">
              <div class="float-right">
                <b-form-select variant="outline-secondary" class="mr-3" @change.native="(ev) => {onChangeDeviceType(ev, source)}" v-model="source.deviceType" :options="listOfDevicesTypeForSelectOptions" />
              </div>
            </b-form-fieldset>
          </div> -->

          <div class="col-md-6" style="padding: 10px">
            <b-form-fieldset description="Enter Device id to filter or select from list" label="Device" :horizontal="false">
              <v-autocomplete :items="source.listOfDevicesForSelectOptions" v-model="source.device" :get-label="getLabel" :component-item='itemAutoTemplate' :input-attrs="{id: 'v-my-autocomplete'}" @update-items="(item) => {updateItems(item, source)}" @item-clicked="(item) => {itemClicked(item, source)}" @change="(item) => {inputChangeEvent(item, source)}">
              </v-autocomplete>
            </b-form-fieldset>
            
            <!-- <b-form-fieldset description="Please select a device" label="Device" :horizontal="false">
              <b-form-select variant="outline-secondary" class="mr-3" @change.native="(ev) => {onChangeDevice(ev, source)}" v-model="source.device" :options="source.listOfDevicesForSelectOptions" />
            </b-form-fieldset> -->
          </div>

          <div class="col-md-3" style="padding: 10px">
            <b-form-fieldset description="Please select a stream" label="Stream" :horizontal="false">
              <b-form-select variant="outline-secondary" class="mr-3" @change.native="(ev) => {onChangeOptionStream(ev, source)}" v-model="source.stream" :options="source.optionsStreams" />
            </b-form-fieldset>
          </div>
          
          <div class="col-md-3" style="padding: 10px">
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

    <!-- Detail data source widget -->
    <b-modal title="Detail" class="modal-info" v-model="widgetDetailModal" >
      <div>
        <span v-html="widgetDetails"></span>
      </div>
    </b-modal>

  </div>
</template>

<script>
// import DragableView from './DragableView'
import BarChart from './charts/BarChart'
import LineChart from './charts/LineChart'
import DoughnutChart from './charts/DoughnutChart'
import RadarChart from './charts/RadarChart'
import PieChart from './charts/PieChart'
import PolarAreaChart from './charts/PolarAreaChart'
import LineChartReport from './charts/LineChartReport'
import moment from 'moment'

import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/remove'
import { Vue2Dragula } from 'vue2-dragula'
import $ from 'jquery'

// auto-complete
import Autocomplete from 'v-autocomplete'
import './../../assets/autocomplete.css'
Vue.use(Autocomplete)
// item template
import ItemTemplate from './../components/ItemTemplate.vue'

//resize div
import VueGridLayout from 'vue-grid-layout'
Vue.config.debug = true;
Vue.config.devtools = true;
var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;

Vue.use(Vue2Dragula, {
  logging: {
    service: false
  }
});

Vue.component('icon', Icon)

export default {
  name: 'dashboard',
  components: {
    // DragableView,
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
    'v-autocomplete': Autocomplete
  },
  data () {
    return {
      widgets: [],
      singleDataModal: false,
      multipleDataModal: false,
      listOfDevicesForSelectOptions : [],
      // { value: null, text: 'Please select a device' }
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
      // device type
      selectedDeviceType: null,
      listOfDevicesTypeForSelectOptions : [{ value: null, text: 'Please select a device type' }],
      // for saving the difference
      diffInWidth: 0,
      // for showing the widget detail in the modal view
      widgetDetails: null,
      widgetDetailModal: false,
      // for multiple data sources in charts
      tableDataSource: [],
      // user id for saving dashboard
      userId: null,
      // default dashboard
      dashboard: null,
      defaultDashboard: [
          {
            x:0,
            y:0,
            w:6,
            h:11,
            i:0,
            title:"Report",
            chart: "line"
          }],
      // auto-complete item template
      itemAutoTemplate: ItemTemplate,
      itemAutoComplete: null,
      //unsubscribed all devices
      unsub: false,
    }
  },
  ready: function() {
    var vm = this;
  },
  mounted () {
    this.userId = this.$raptor.Auth().getUser().uuid
    this.getUserDashboardPreferences('dashboard',this.userId);
    // this.fetchData();
    this.fetchDevicesData();
    // for default values
    this.populateMultipleDataSourceFields();
  },
  methods: {
    // grid stack events
    moveEvent: function(i, newX, newY){
        console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
    },
    resizeEvent: function(i, newH, newW){
        console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW);
        // $('#widget'+i).width(((newH*40)-100)+'px')
        for (var index = 0; index < this.widgets.length; index++) {
          if(i === index) {
            let g = this.widgets[index]
            // if(g.w == newW) {
              if (g.h > newH) {
                g.w = g.w - 1
                this.diffInWidth = this.diffInWidth - 1
              } else {
                g.w = g.w + 1
                this.diffInWidth = this.diffInWidth + 1
              }
            // }
            this.widgets[index] = g
            console.log(JSON.stringify(this.widgets[index]))
          }
        }
    },
    movedEvent: function(i, newX, newY){
        console.log("MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
        // console.log(this.widgets)
        for (var j = 0; j < this.widgets.length; j++) {
          if(this.widgets[j].i == i) {
            this.widgets[j].x = newX
            this.widgets[j].y = newY
          }
        }
        this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
    },
    resizedEvent: function(i, newH, newW, newHPx, newWPx){
        console.log("RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
        console.log(JSON.stringify(this.widgets[i]))
        for (var j = 0; j < this.widgets.length; j++) {
          if(this.widgets[j].i == i) {
            console.log(this.widgets[j].w == newW)
            if(this.widgets[j].w == newW && this.diffInWidth == 0) {
              this.widgets[j].w = newW
            } else {
              this.widgets[j].w = this.widgets[j].w + this.diffInWidth
            }
            this.widgets[j].h = newH
            console.log(JSON.stringify(this.widgets[j]))
          }
        }
        // console.log(this.widgets)
        this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
    },
    // page functionality
    formatDate (d) {
      return moment(new Date(d)).format('MMMM Do YYYY');
    },
    /*fetchData () {
      let userId = this.$raptor.Auth().getUser().uuid
      let context = this
      let pathDashboard = '/users/'+userId+'/dashboard'
      this.readDataFirebase('/users/', function(snapshot) {
        if(snapshot.hasChild(userId)) {
          console.log(snapshot.val())
          if(snapshot.child(userId).hasChild('dashboard')) {
            let arr = snapshot.child(userId).child('dashboard').val()
            context.loadDefaultCharts(arr)
            // context.setUserDashboardPreferences('dashboard', arr, userId);
          }
        } else {
          context.$dbFirebase.ref('users/' + userId).set({dashboard: defaultDashboard});
          context.loadDefaultCharts(defaultDashboard)
        }
      })
    },*/
    populateMultipleDataSourceFields() {
      let obj = {
        number: 0,
        deviceType: null,
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
          list.forEach((e) => {
            this.listOfDevicesForSelectOptions.push(e)
            // {value: e.id, text: e.name+' - '+e.id}
            // if(this.listOfDevicesTypeForSelectOptions.indexOf(e.name) == -1) {
            //   this.listOfDevicesTypeForSelectOptions.push(e.name)
            // }
          });
          // console.log(this.listOfDevicesTypeForSelectOptions)
        })
      .catch(function(e) {
        // console.log(e)
        // console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          this.$raptor.Auth().logout();
          this.$router.push("/pages/login");
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
    showDetails(event, widgetsData) {
      // console.log(widgetsData)
      this.$raptor.Inventory().read(widgetsData.device)
        .then((device) => {
          // console.log(device)
          this.widgetDetails = null
          let widgetDetails = null;
          if(device.id == widgetsData.device) {
            widgetDetails = '<ul>';
            widgetDetails += '<li><strong>Device Name:</strong>     ' + device.name + '</li>';
            widgetDetails += '<li><strong>Device created at:</strong>     ' + this.formatDate(device.json.createdAt) + '</li>';
            widgetDetails += '<li><strong>Device Id:</strong>     ' + device.id + '</li>';
            if(device.streams[widgetsData.stream]) {
              widgetDetails += '<li><strong>Stream Name:</strong>     ' + device.streams[widgetsData.stream].name + '</li>';
            }
            let stream = device.streams[widgetsData.stream]
            if(stream.json.channels[widgetsData.channel]) {
              let channel = stream.json.channels[widgetsData.channel]
              widgetDetails += '<li><strong>Channel Name:</strong>     ' + channel.name + '</li>';
              widgetDetails += '<li><strong>Channel Type:</strong>     ' + channel.type + '</li>';
            }
            widgetDetails += '</ul>';
          }
          this.widgetDetails = widgetDetails
          this.widgetDetailModal = true
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          // this.$log.error(e)
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
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
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
      // this.writeToFirebase(widget)
    },
    onChangeDeviceType (evt, source) {
      let val = evt.target.value;
      let listOfDevicesForSelectOptions = []
      // { value: null, text: 'Please select a device' }
      this.devices.forEach((e) => {
        if(e.name == val){
          listOfDevicesForSelectOptions.push(e)
          // {value: e.id, text: e.name+' - '+e.id}
        }
      });
      if(source) {
        for (var j = 0; j < this.tableDataSource.length; j++) {
          if(source.number == this.tableDataSource[j].number) {
            this.tableDataSource[j].listOfDevicesForSelectOptions = listOfDevicesForSelectOptions
          }
        }
      } else {
        this.listOfDevicesForSelectOptions = listOfDevicesForSelectOptions
      }
    },
    /*onChangeDevice (evt, source) {
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
    },*/
    onChangeOptionStream (evt, source) {
      let val = evt.target.value;
      if(val) {
        // console.log(val)
        this.selectedStream = val;
        let stream = this.selectedDeviceDetail.json.streams[val];
        if(stream) {
          // console.log(stream)
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
      let alreadyAdded = false
      for (var i = 0; i < this.widgets.length; i++) {
        if(this.widgets[i].title == 'Report') {
          alreadyAdded = true
        }
      }
      if(!alreadyAdded) {
        this.widgets.push(widget)
        this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
      }
      // this.writeToFirebase(widget)
    },
    // button click for modals
    onAddChartButtonClick (evt) {
      // console.log("device: " + this.selectedDevice + " stream: " + this.selectedStream + " channel: " + this.selectedChannel + " chart: " + this.selectedChart)
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
      this.clearFields()
    },
    onRemoveWidgetButtonClick (widget) {
      let index = this.widgets.indexOf(widget)
      this.widgets.splice(index, 1)
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
      // this.readDataFirebase('/users/'+userId, function(snapshot) {
      //   if(snapshot.hasChild('dashboard')) {
      //     let arr = snapshot.child('dashboard').val()
      //     let index = arr.indexOf(widget)
      //     arr.splice(index, 1)
      //     console.log(arr)
      //     context.$dbFirebase.ref('users/' + userId).set({dashboard: arr});
      //   }
      // })
    },
    onCreateChannelButton () {
      if(this.tableDataSource.length < 5) {
        let obj = {
          number: this.tableDataSource.length+1,
          deviceType: null,
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
      this.clearFields()
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
      // this.writeToFirebase(widget)
    },
    clearFields () {
      if(this.tableDataSource.length > 0) {
        this.selectedChart = null
        this.selectedTitle = null
        this.tableDataSource = []
        this.populateMultipleDataSourceFields();
      } else {
        this.listOfDevicesForSelectOptions = []
        this.optionsStreams = []
        this.optionsChannel = []
        this.selectedChart = null
        this.selectedTitle = ""
        this.selectedDeviceType = null
        this.selectedDevice = null
        this.selectedStream = null
        this.selectedChannel = null
      }
    },
    // firebase functions
    /*readDataFirebase(path, fun) {
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
    },*/
    // user profile
    getUserDashboardPreferences(key, userId) {
      this.$raptor.Profile().get(key, userId)
      .then((dashboard) => {
        // console.log(dashboard);
        if(dashboard.length > 0) {
          this.loadDefaultCharts(dashboard)
        } else {
          this.setUserDashboardPreferences('dashboard', this.defaultDashboard, this.userId);
          this.loadDefaultCharts(this.defaultDashboard)
        }
      })
      .catch(function(e) {
        // console.log(e)
        // console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          this.$raptor.Auth().logout();
          this.$router.push("/pages/login");
        }
      });
    },
    setUserDashboardPreferences(key, value, userId) {
      this.$raptor.Profile().set(key, value, userId)
      .then((dashboard) => {
        // this.$log.debug('Loaded %s device list', list.length);
        // console.log(dashboard);
      })
      .catch(function(e) {
        // console.log(e)
        // console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          this.$raptor.Auth().logout();
          this.$router.push("/pages/login");
        }
      });
    },

    // auto-complete methods
    itemClicked (item, source) {
      console.log('You clicked an item!', item)
      let selectedDevice = null
      let optionsStreams = []
      for (var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].id == item.id) {
          selectedDevice = this.devices[i]
          this.selectedDeviceDetail = selectedDevice;
          if(this.selectedDeviceDetail) {
            let keys = Object.keys(this.selectedDeviceDetail.json.streams);
            // console.log(keys);
            optionsStreams.push({ value: null,text: 'Please select a stream' });
            for (var j = 0; j < keys.length; j++) {
              optionsStreams.push({ value: keys[j],text: keys[j] });
            }
          }
        }
      }
      if(source) {
        for (var j = 0; j < this.tableDataSource.length; j++) {
          if(source.number == this.tableDataSource[j].number) {
            this.tableDataSource[j].device = selectedDevice
            this.tableDataSource[j].optionsStreams = optionsStreams
          }
        }
      } else {
        this.selectedDevice = selectedDevice
        this.optionsStreams = optionsStreams
      }
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
    inputChangeEvent(text, source) {
      if(text == '') {
        if(source) {
          for (var j = 0; j < this.tableDataSource.length; j++) {
            if(source.number == this.tableDataSource[j].number) {
              this.tableDataSource[j].listOfDevicesForSelectOptions = this.devices
            }
          }
          let data = this.tableDataSource
          this.tableDataSource = []
          this.tableDataSource = data
        } else {
          this.listOfDevicesForSelectOptions = this.devices
        }
      }
    },
    getLabel (item) {
      return item.name + " - " + item.id
    },
    updateItems (text, source) {
      // console.log(text)
      let listOfDevicesForSelectOptions = []
      for (var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].id.indexOf(text) !== -1 || this.devices[i].name.indexOf(text) !== -1) {
          listOfDevicesForSelectOptions.push(this.devices[i])
        }
      }
      if(source) {
        for (var j = 0; j < this.tableDataSource.length; j++) {
          if(source.number == this.tableDataSource[j].number) {
            this.tableDataSource[j].listOfDevicesForSelectOptions = listOfDevicesForSelectOptions
          }
        }
        let data = this.tableDataSource
        this.tableDataSource = []
        this.tableDataSource = data
      } else {
        this.listOfDevicesForSelectOptions = listOfDevicesForSelectOptions
      }
    },
    // to show the full screen chart with detailed data on new page
    onFullChartButtonClick(ev, wid) {
      // this.unsubscribeAllCharts(wid)
      this.$raptor.Stream().unsubscribe({name: wid.data.stream, deviceId: wid.data.device}, function(msg) {
        console.log(msg)
      }).then(() => {
        this.$router.push({
            name: 'ChartDetail',
            params: {
                widgetData: wid
            }
        });
      })
      // this.$router.push({
      //     name: 'ChartDetail',
      //     params: {
      //         widgetData: wid
      //     }
      // });
    },
    // unsubscribe charts
    unsubscribeAllCharts(wid) {
      var context = this
      let widgetsThatHaveStream = 0
      for (var i = 0; i < this.widgets.length; i++) {
        if(this.widgets[i].data) {
          widgetsThatHaveStream ++
          this.$raptor.Stream().unsubscribe({name: this.widgets[i].data.stream, deviceId: this.widgets[i].data.device}, function(msg) {
            console.log(msg)
            unsub++
            if(unsub == widgetsThatHaveStream) {
              context.$router.push({
                  name: 'ChartDetail',
                  params: {
                      widgetData: wid
                  }
              });
            }
          });
        }
      }
    },
  }
}
</script>