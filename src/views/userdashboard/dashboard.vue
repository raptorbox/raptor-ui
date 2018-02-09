<template>
  <div class="wrapper">
    <div class="animated fadeIn">
      <div class="col-md-9">
        <!-- <button @click="addWidget">Add Widget</button> -->
        <!-- <b-button type="button" variant="success" @click="addChartForDevicesCount">Add Device Count Chart</b-button> -->
        <!-- <b-button type="button" variant="success" @click="singleDataModal = true">Add Widget</b-button> -->
        <b-button type="button" variant="success" @click="multipleDataModal = true">Add Chart Widget</b-button>
      </div>

      <div class="card-columns cols-2">
        <div class="container" v-dragula="widgets" drake="first"> 
          <div v-for="wid in widgets">
            <b-card show-header>
              <div slot="header">
                <div class="row" id="cardHeader">
                  <!-- <b-tooltip target="cardHeader">
                    <div v-html="showMouseOverDetail"></div>
                  </b-tooltip> -->
                  <div class="col-md-12 bg-light" style="padding:2px; padding-top:4px">
                  <div class="float-right">
                    <button type="button" i="wid.i" class="btn btn-link" @click="(ev) => { showDetails(ev, wid.data) }" >
                      <i class="icon-info icons font-2xl d-block" />
                    </button>
                    <button type="button" i="wid.i" class="btn btn-link" @click="(ev) => { onFullChartButtonClick(ev, wid) }" >
                      <i class="icon-size-fullscreen icons font-2xl d-block" />
                    </button>
                    <b-button type="button" i="wid.i" class="btn btn-link btn-sm" @click="(ev) => { onRemoveWidgetButtonClick(ev, wid) }">
                      <i class="icon-close icons font-2xl d-block" />
                    </b-button>
                  </div>
                  <!-- <div class="float-left" v-on:click.capture="(ev) => { editWidget(ev, wid) }">
                    <h5>{{wid.title}}  <i class="icon-pencil icons" /></h5>
                  </div> -->
                  <div class="float-left">
                    <h5>{{wid.title}}</h5>
                  </div>
                  </div>
                </div>
              </div>
              <!-- <div class="row">
                <div class="col-md-12">
                    <span v-html="wid.widgetDetails"></span>
                </div>
              </div> -->
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
      </div>
    </div>

    <!-- multi data source widget -->
    <b-modal title="Add Widget" size="lg" class="modal-info" v-model="multipleDataModal" @ok="onAddMixChart" @cancel="clearFields">
      <b-form-fieldset description="Please enter a widget title" label="Title" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="selectedTitle"></b-form-input>
      </b-form-fieldset>
      <b-button class="btn btn-primary" block @click="onCreateChannelButton">Add Source</b-button>
      <div v-for="source in tableDataSource" id="stream">
        <div class="row row-fluid">
 
          <div class="col-md-6" style="padding: 10px">
            <b-form-fieldset description="Enter Device id to filter or select from list" label="Device" :horizontal="false">
              <v-autocomplete :items="source.listOfDevicesForSelectOptions" v-model="source.device" :get-label="getLabel" :component-item='itemAutoTemplate' :input-attrs="{id: 'v-my-autocomplete', placeholder:'Please search/select a device'}" @update-items="(item) => {updateItems(item, source)}" @item-clicked="(item) => {itemClicked(item, source)}" @change="(item) => {inputChangeEvent(item, source)}" :auto-select-one-item="false">
              </v-autocomplete>
            </b-form-fieldset>

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
      { value: null,        text: 'Please select a chart'                     },
      { value: 'line',      text: 'Line Chart'              , disabled: false },
      { value: 'bar',       text: 'Bar Chart'               , disabled: false },
      { value: 'pie',       text: 'Pie Chart'               , disabled: false },
      { value: 'polar',     text: 'Polar Chart'             , disabled: false },
      { value: 'radar',     text: 'Radar Chart'             , disabled: false },
      { value: 'doughnut',  text: 'Doughnut Chart'          , disabled: false },
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
      defaultDashboard: [],
          // {
          //   x:0,
          //   y:0,
          //   w:6,
          //   h:11,
          //   i:0,
          //   title:"Report",
          //   chart: "line"
          // }],
      // auto-complete item template
      itemAutoTemplate: ItemTemplate,
      //unsubscribed all devices
      unsub: false,
      // tooltip
      showMouseOverDetail: null,
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
    populateMultipleDataSourceFields() {
      let obj = {
        number: 0,
        deviceType: null,
        device: null,
        stream: null,
        channel: null,
        optionsStreams: [],
        optionsChannel: [],
        listOfDevicesForSelectOptions: this.listOfDevicesForSelectOptions
      }
      this.tableDataSource.push(obj)
    },
    fetchDevicesData () {
      this.$raptor.Inventory().list()
      .then((list) => {
        // this.$log.debug('Loaded %s device list', list.length);
          // console.log(list);
          this.$data.devices = list.getContent();
          // list.forEach((e) => {
          //   this.listOfDevicesForSelectOptions.push(e)
            // {value: e.id, text: e.name+' - '+e.id}
            // if(this.listOfDevicesTypeForSelectOptions.indexOf(e.name) == -1) {
            //   this.listOfDevicesTypeForSelectOptions.push(e.name)
            // }
          // });
          this.listOfDevicesForSelectOptions = list.getContent()
          this.tableDataSource[0].listOfDevicesForSelectOptions = this.listOfDevicesForSelectOptions
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
      this.widgets = dasboardWidgets
      let details = ''
      for (var i = 0; i < dasboardWidgets.length; i++) {
          if(dasboardWidgets[i].data) {
            if(!(dasboardWidgets[i].data.constructor === Array)) {
              details = ''
              details += '<div class="col-md-12">';
              details += '<strong> Device: </strong>'
              details += dasboardWidgets[i].data.device.id + ' - ' + dasboardWidgets[i].data.stream + ' - ' + dasboardWidgets[i].data.channel
              details += '</div>'
            } else {
              details = ''
              for (var j = 0; j < dasboardWidgets[i].data.length; j++) {
                details += '<div class="col-md-12">';
                details += '<strong> Device ' + (j+1) +': </strong>'
                details += dasboardWidgets[i].data[j].device.id + ' - ' + dasboardWidgets[i].data[j].stream + ' - ' + dasboardWidgets[i].data[j].channel
                details += '</div>'
              }
            }
            dasboardWidgets[i].widgetDetails = details
          }
      }
    },
    showDetails(event, widgetsData) {
      console.log(widgetsData)
      if(widgetsData == null) {
        return false
      }
      if(widgetsData.constructor === Array) {
        this.widgetDetails = this.showMultipleDevicesDetails(widgetsData)
        this.widgetDetailModal = true
      } else {
        this.$raptor.Inventory().read(widgetsData.device)
        .then((device) => {
          // console.log(device)
          this.widgetDetails = null
          let widgetDetails = null;
          // console.log(device.id == widgetsData.device)
          if(device.id == widgetsData.device.id) {
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
      }
    },
    editWidget (event, widgetsData) {
      console.log(widgetsData)
      if(widgetsData.title == 'Report') {
        return
      }
      if(widgetsData.constructor === Array) {
        this.widgetDetails = this.showMultipleDevicesDetails(widgetsData)
        this.widgetDetailModal = true
      } else {
        this.selectedChart = widgetsData.chart
        this.selectedTitle = widgetsData.title
        this.selectedDevice = widgetsData.data.device
        this.optionsStreams = [{ value: null, text: 'Please select a stream' }]
        this.optionsChannel = [{ value: null, text: 'Please select a channel' }]
        this.selectedDeviceDetail = widgetsData.data.device
        let streamKeys = Object.keys(widgetsData.data.device.streams)
        for (var i = 0; i < streamKeys.length; i++) {
          console.log(streamKeys[i])
          this.optionsStreams.push({ value: streamKeys[i], text:streamKeys[i] })
          if(streamKeys[i].name == widgetsData.data.stream) {
            let chKeys = Object.keys(widgetsData.data.device.streams[streamKeys[i]].channels)
            console.log(chKeys)
            chKeys.forEach((e) => {
              this.optionsChannel.push({ value: e, text: e })
            })
          }
        }
        console.log(this.optionsStreams)
        console.log(this.optionsChannel)
        this.selectedStream = widgetsData.data.stream
        this.selectedChannel = widgetsData.data.channel
        this.singleDataModal = true
      }
    },
    showMultipleDevicesDetails (deviceArray) {
      // console.log(deviceArray)
      let devices = deviceArray.length
      let selectedDeviceDetails = ''
      for (var i = 0; i < devices; i++) {
        selectedDeviceDetails += '<div class="col-md-12">';
        selectedDeviceDetails += '<h3> Device ' + (i+1) +'</h3>'
        selectedDeviceDetails += this.showDeviceDetails(deviceArray[i])
        selectedDeviceDetails += '</div>'
      }
      return selectedDeviceDetails
    },
    showDeviceDetails (dev) {
      let selectedDeviceDetails = '<ul>';
      selectedDeviceDetails += '<li><strong>Name:</strong>     ' + dev.device.name + '</li>';
      selectedDeviceDetails += '<li><strong>id:</strong>       ' + dev.device.id + '</li>';
      // console.log(dev.device.streams[dev.stream])
      if(dev.device.streams[dev.stream]) {
        selectedDeviceDetails += '<li><strong>Stream Name:</strong>     ' + dev.stream + '</li>';
      }
      let stream = dev.device.streams[dev.stream]
      if(stream.channels[dev.channel]) {
        let channel = stream.channels[dev.channel]
        selectedDeviceDetails += '<li><strong>Channel Name:</strong>     ' + channel.name + '</li>';
        selectedDeviceDetails += '<li><strong>Channel Type:</strong>     ' + channel.type + '</li>';
      }
      selectedDeviceDetails += '</ul>';
      return selectedDeviceDetails
    },
    addWidget(widData) {
      let widget = {
        x:(this.widgets.length%2)*6,
        y:(this.widgets.length%2)*11,
        w:6,
        h:11,
        i:this.widgets.length+1,
        title: (widData.title == null || widData.title == '') ? 'Widget' : widData.title,
        chart: widData.chart,
        data:{
          device: widData.data.device,
          stream: widData.data.stream,
          channel: widData.data.channel
        }
      }
      this.widgets.push(widget)
      this.loadDefaultCharts(this.widgets)
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
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
        console.log(this.selectedDeviceDetail)
        let stream = this.selectedDeviceDetail.json.streams[val];
        if(stream) {
          // console.log(stream)
          this.selectedStreamDetail = stream
          if(stream.dynamic) {
            this.fetchStreamDataForChannels(stream, source)
          } else {
            this.populateChannelSelectOptionsForStream(stream, source)
          }
        }
      }
    },
    populateChannelSelectOptionsForStream(stream, source) {
      let keys = Object.keys(stream.channels);
      let optionsChannel = [];
      optionsChannel.push({ value: null,text: 'Please select a Channel' });
      for (var i = 0; i < keys.length; i++) {
        if(stream.channels[keys[i]].type === 'number' || stream.channels[keys[i]].type === 'boolean') {
          optionsChannel.push({ value: keys[i],text: keys[i] });
        } else {
          optionsChannel.push({ text: keys[i], disabled: true });
        }
      }
      if(source) {
        for (var i = 0; i < this.tableDataSource.length; i++) {
          if(source.number == this.tableDataSource[i].number) {
            this.tableDataSource[i].optionsChannel = optionsChannel
          }
        }
      } else {
        this.optionsChannel = optionsChannel
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
      this.selectedDevice = null
      this.clearFields()
    },
    onRemoveWidgetButtonClick (ev, widget) {
      // console.log(widget)
      let index = this.widgets.indexOf(widget)
      this.widgets.splice(index, 1)
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
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
          optionsChannel: [],
          listOfDevicesForSelectOptions: this.listOfDevicesForSelectOptions
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
        title: (this.selectedTitle == null || this.selectedTitle == '') ? 'Widget' : this.selectedTitle,
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
      this.loadDefaultCharts(this.widgets)
      this.clearFields()
      this.setUserDashboardPreferences('dashboard', this.widgets, this.userId);
      // this.writeToFirebase(widget)
    },
    clearFields () {
      if(this.tableDataSource.length > 0) {
        this.selectedChart = null
        this.selectedTitle = null
        this.tableDataSource = []
        // this.populateMultipleDataSourceFields();
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
      if(this.$raptor) {
        this.$raptor.Profile().set(key, value, userId)
        .then((dashboard) => {
          // this.$log.debug('Loaded %s device list', list.length);
          console.log("Dashboard updated")
          console.log(dashboard);
        })
        .catch(function(e) {
          // console.log(e)
          // console.log(JSON.stringify(e))
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        });
      }
    },

    // auto-complete methods
    itemClicked (item, source) {
      let selectedDevice = null
      let optionsStreams = []
      for (var i = 0; i < this.devices.length; i++) {
        if(this.devices[i].id == item.id) {
          selectedDevice = this.devices[i]
          this.selectedDeviceDetail = selectedDevice;
          if(this.selectedDeviceDetail) {
            let keys = Object.keys(this.selectedDeviceDetail.json.streams);
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
              this.tableDataSource[j].optionsStreams = []
              this.tableDataSource[j].optionsChannel = []
              this.tableDataSource[j].device = null
              this.tableDataSource[j].stream = null
              this.tableDataSource[j].channel = null
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
            if(listOfDevicesForSelectOptions.length == 1) {
              this.tableDataSource[j].device = listOfDevicesForSelectOptions[0]
              this.itemClicked(listOfDevicesForSelectOptions[0], source)
            }
          }
        }
        let data = this.tableDataSource
        this.tableDataSource = []
        this.tableDataSource = data
      } else {
        this.listOfDevicesForSelectOptions = listOfDevicesForSelectOptions
        if(listOfDevicesForSelectOptions.length == 1) {
          this.selectedDevice = listOfDevicesForSelectOptions[0]
          this.itemClicked(this.selectedDevice, source)
        }
      }
    },
    // to show the full screen chart with detailed data on new page
    onFullChartButtonClick(ev, wid) {
      if(wid.data) {
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
        .catch(function(e) {
          // console.log(e)
          // console.log(JSON.stringify(e))
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      }
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
    // fetch channels for dynamic streams
    fetchStreamDataForChannels (stream, source) {
      this.$raptor.Stream().list(stream, 0, 1, 'timestamp,desc')
      .then((streams) => {
        // console.log(streams)
        if(streams.length > 0) {
          let chs = streams[0].channels
          let keys = Object.keys(chs);
          let optionsChannel = [];
          console.log(keys)
          for (var i = 0; i < keys.length; i++) {
            if(!isNaN(chs[keys[i]] * 1)) {
              if(optionsChannel.length == 0) {
                optionsChannel.push({ value: null,text: 'Please select a Channel' });
              }
              optionsChannel.push({ value: keys[i],text: keys[i] });
            }
          }
          console.log(optionsChannel)
          if(source) {
            for (var i = 0; i < this.tableDataSource.length; i++) {
              if(source.number == this.tableDataSource[i].number) {
                this.tableDataSource[i].optionsChannel = optionsChannel
              }
            }
          } else {
            this.optionsChannel = optionsChannel
          }
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
    },
  }
}
</script>