<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="col-md-12">
        <b-card class="bg-danger" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
          <div class="card-body pb-0">
            <h4 class="mb-0">Device Details</h4>
          </div>
          <div class="card-body pb-0">
            <div class="row" v-html="selectedDeviceDetails"></div>
          </div>
        </b-card>
      </div>
    </div><!--/.row-->

    <b-card>
      <div class="row">
        <div class="col-sm-12 hidden-sm-down">
          <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button-group class="mr-3" aria-label="First group">
              <b-button variant="outline-secondary" value="hour" @click="onChangeDisplayDataTime">Hours</b-button>
              <b-button variant="outline-secondary" value="day" @click="onChangeDisplayDataTime">Day</b-button>
              <b-button variant="outline-secondary" value="month" @click="onChangeDisplayDataTime">Month</b-button>
              <b-button variant="outline-secondary" value="realhour" @click="onChangeDisplayDataTime">Real time</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div><!--/.col-->
      </div><!--/.row-->
      <div>
        <div v-if="widgetData.chart == 'bar'">
          <div class="chart-wrapper">
            <bar-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'polar'">
          <div class="chart-wrapper">
            <polar-area-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'line' && widgetData.data">
          <div class="chart-wrapper">
            <line-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'pie'">
          <div class="chart-wrapper">
            <pie-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'radar'">
          <div class="chart-wrapper">
            <radar-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'doughnut'">
          <div class="chart-wrapper">
            <doughnut-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj"/>
          </div>
        </div>
        <div v-if="widgetData.data == null" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj">
          <div class="chart-wrapper">
            <line-chart-report />
          </div>
        </div>
      </div>
      <div class="col-md-12">
        <vue-slider ref="slider" v-bind="slider" v-model="slider.value" @callback="sliderValueChanged" @drag-start="sliderDragStart" @drag-end="sliderDragEnd"></vue-slider>
      </div>
    </b-card>
  </div>
</template>


<script>
import moment from 'moment'
import vueSlider from 'vue-slider-component'

import BarChart from './../userdashboard/charts/BarChart'
import LineChart from './../userdashboard/charts/LineChart'
import DoughnutChart from './../userdashboard/charts/DoughnutChart'
import RadarChart from './../userdashboard/charts/RadarChart'
import PieChart from './../userdashboard/charts/PieChart'
import PolarAreaChart from './../userdashboard/charts/PolarAreaChart'
import LineChartReport from './../userdashboard/charts/LineChartReport'

var currentDate = moment();

export default {
  name: 'realtimechart',
  props: ['widgetData'],
  components: {
    vueSlider,
    // charts
    BarChart,
    LineChart,
    DoughnutChart,
    RadarChart,
    PieChart,
    PolarAreaChart,
    LineChartReport,
  },
  data () {
    return {
      device: null,
      selectedDeviceDetails: null,
      realtimeData: null,
      realtimeDataLabels: null,
      // slider value to show the instances of reading in chart
      chartLoaded: false,
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
        widgetDatath: 'auto',
        height: 6,
        dotSize: 16,
        dotHeight: null,
        dotwidgetDatath: null,
        interval: 1,
        show: true,
        speed: 0.5,
        disabled: false,
        piecewise: true,
        // piecewiseStyle: {
        //   "backgroundColor": "#ccc",
        //   "visibility": "visible",
        //   "widgetDatath": "12px",
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
      // search query
      searchDataObj: null,
      dataToPass: null,
    }
  },
  mounted () {
    this.$nextTick(() => this.$refs.slider.refresh())
    // console.log(this.widgetData)
  },
  methods: {
    formatDate (d) {
      return moment(new Date(d)).format('MMMM Do YYYY');
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
      if(this.widgetData.data.stream && this.widgetData.data.channel && this.device) {
        let dateArray = this.getDateList(this.device.json.createdAt*1000,moment().unix()*1000, this.selectedDisplayParam)
        dateArray.reverse()
        let slider = this.$refs['slider']
        this.slider.data = dateArray
        slider.setIndex([0,1])
        // console.log(this.slider.data)
        // console.log(this.slider.value)
        this.dataToPass = {display: this.selectedDisplayParam, fromDate: this.slider.data[1], toDate: this.slider.data[0]}
        this.searchDataObj = null
        this.searchDataObj = this.dataToPass
        // console.log(this.dataToPass)
        // this.searchDataObj(this.selectedDev.json.streams[this.selectedStream], this.slider.data[1], this.slider.data[0])
      }
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
      if(this.selectedDisplayParam == null || this.selectedDisplayParam == '' ) {
        this.selectedDisplayParam = 'hour'
      }
      if(this.chartLoaded) {
        this.dataToPass = {display: this.selectedDisplayParam, fromDate: this.slider.value[1], toDate: this.slider.value[0]}
        this.searchDataObj = this.dataToPass
      }
    },
    sliderDragStart () {
      this.isSliderDragging = true
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

    //setting device data coming from child component
    setDeviceData (data) {
      this.device = data
      if(this.device.constructor === Array && this.device.length > 0) {
        this.selectedDeviceDetails = this.showMultipleDevicesDetails(this.device)
        this.chartLoaded = true
      } else {
        this.selectedDeviceDetails = this.showDeviceDetails(this.device)
        let dateArray = this.getDateList(this.device.json.createdAt*1000,moment().unix()*1000, 'hour')
        dateArray.reverse()
        this.slider.data = dateArray
        let slider = this.$refs['slider']
        slider.setIndex([0,1])
        this.chartLoaded = true
      }
    },
    // for device details
    showDeviceDetails (device) {
      let selectedDeviceDetails = '<ul>';
      selectedDeviceDetails += '<li><strong>Name:</strong>     ' + device.name + '</li>';
      selectedDeviceDetails += '<li><strong>id:</strong>       ' + device.id + '</li>';
      selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(device.json.createdAt*1000) + '</li>';
      selectedDeviceDetails += '</ul>';
      return selectedDeviceDetails
    },
    showMultipleDevicesDetails (deviceArray) {
      this.chartLoaded = true
      let devices = deviceArray.length
      let selectedDeviceDetails = ''
      for (var i = 0; i < devices; i++) {
        selectedDeviceDetails += '<div class="col-md-' + (12/devices) + '">';
        selectedDeviceDetails += this.showDeviceDetails(deviceArray[i])
        selectedDeviceDetails += '</div>'
      }
      return selectedDeviceDetails
    },
  }
}
</script>