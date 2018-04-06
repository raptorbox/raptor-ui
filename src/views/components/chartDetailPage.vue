<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="col-md-12">
        <b-card class="bg-danger" :no-block="true">
          <div class="card-body pb-0">
            <h4 class="mb-0">Device Details</h4>
          </div>
          <div class="card-body pb-0">
            <div class="row" v-html="selectedDeviceDetails"></div>
          </div>
        </b-card>
      </div>
    </div><!--/.row-->

    <b-card style="position: relative;">
      <div v-if="spinnerLoading" class="overlay row">
        <div class="loadingView text-dark">
           <!-- bg-white -->
          <div class="loadingViewInner">
            <div class="text-center">
              <pulse-loader :loading="spinnerLoading" :color="color" :size="size"></pulse-loader>
            </div>
            <div class="text-center">
              <p>{{loadingMessage}}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- && device.constructor === Array && device.length > 0 -->
      <div class="row" v-if="device">
        <div class="col-sm-12 hidden-sm-down">
          <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button variant="outline-secondary" @click="showHideSearchView">
              <i v-if="collapsed" class="icon-arrow-up"></i>
              <i v-else class="icon-arrow-down"></i>
          </b-button>
            <b-button-group class="mr-3" aria-label="First group">
              <!-- <b-button variant="outline-secondary" value="hour" @click="onChangeDisplayDataTime">Hours</b-button> -->
              <!-- <b-button variant="outline-secondary" value="day" @click="onChangeDisplayDataTime">Day</b-button> -->
              <!-- <b-button variant="outline-secondary" value="month" @click="onChangeDisplayDataTime">Month</b-button> -->
              <b-button variant="outline-secondary" value="realhour" @click="onChangeDisplayDataTime">Real time</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div><!--/.col-->
      </div><!--/.row-->
      <div class="row" v-if="collapsed">
        <div class="col-md-12">
          <b-form-fieldset label="Select date & time to search data" :horizontal="false">
            <b-row>
              <b-col lg="5">
                <b-input-group>
                  <b-input-group-addon>From</b-input-group-addon>
                  <date-picker class="form-control" placeholder="Select start date and time" :config="dateTimePicker" v-model="fromDate" >
                  </date-picker>
                </b-input-group>
              </b-col>
              <b-col lg="5">
                <b-input-group>
                  <b-input-group-addon>To</b-input-group-addon>
                  <date-picker class="form-control" :config="dateTimePicker" placeholder="Select end date and time" v-model="toDate">
                  </date-picker>
                </b-input-group>
              </b-col>
              <b-col lg="2">
                <b-button variant="outline-secondary" @click="searchData">Search</b-button>
              </b-col>
            </b-row>
          </b-form-fieldset>
        </div>
      </div>
      <div>
        <div v-if="widgetData.chart == 'bar'">
          <div class="chart-wrapper">
            <bar-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'polar'">
          <div class="chart-wrapper">
            <polar-area-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'line' && widgetData.data">
          <div class="chart-wrapper">
            <line-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'pie'">
          <div class="chart-wrapper">
            <pie-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'radar'">
          <div class="chart-wrapper">
            <radar-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-else-if="widgetData.chart == 'doughnut'">
          <div class="chart-wrapper">
            <doughnut-chart :chartData="widgetData.data" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event"/>
          </div>
        </div>
        <div v-if="widgetData.data == null" @devicedata="setDeviceData" :dataPassed="dataToPass" :searchData="searchDataObj" @isLoadingDone="spinnerLoading = $event">
          <div class="chart-wrapper">
            <line-chart-report />
          </div>
        </div>
      </div>
      <!-- && device.constructor === Array && device.length > 0 -->
      <!-- <div class="col-md-12" v-if="device">
        <vue-slider ref="slider" v-bind="slider" v-model="slider.value" @callback="sliderValueChanged" @drag-start="sliderDragStart" @drag-end="sliderDragEnd"></vue-slider>
      </div> -->
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

  // data and time picker
  import datePicker from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';
  import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate';
  import 'flatpickr/dist/plugins/confirmDate/confirmDate.css';
  import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

var currentDate = moment();

export default {
  name: 'realtimechart',
  props: ['widgetData'],
  components: {
    //datetime picker
    datePicker,
    //vue slider
    vueSlider,
    // charts
    BarChart,
    LineChart,
    DoughnutChart,
    RadarChart,
    PieChart,
    PolarAreaChart,
    LineChartReport,
    // pulse loader
    PulseLoader
  },
  data () {
    return {
      collapsed: false,
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
      realtimeUpdate: false,
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
      // from and to date for search
      fromDate: new Date(),
      toDate: new Date(),
      currentTime: new Date(),
      dateTimePicker: {
        enableTime: true,
        altInput: true,
        defaultDate: new Date(),
        // maxDate: 'today',
        wrap: true,
        enableSeconds: true,
        weekNumbers: true,
        plugins: [new ConfirmDatePlugin({confirmText: 'Done', showAlways:true})]
      },
      // spinner
      color: '#3AB982',
      size: '20px',
      spinnerLoading: true,
      loadingMessage: 'Loading... Please wait.'
    }
  },
  mounted () {
    if(this.$refs.slider) {
      this.$nextTick(() => this.$refs.slider.refresh())
      // console.log(this.widgetData)
    }
  },
  methods: {
    formatDate (d) {
      return moment(new Date(d)).format('MMMM Do YYYY');
    },
    onChangeDisplayDataTime (evt) {
      let val = evt.target.value;
      console.log(val)
      if(val == 'realhour') {
        this.realtimeUpdate = true
      }
      // if(val == this.selectedDisplayParam) {
      //   return
      // }
      if(val == null) {
        this.selectedDisplayParam = 'hour';
      }
      this.selectedDisplayParam = val;
      let d1 = new Date();
      let d2 = new Date();
      let requiredDate = null
      if(this.selectedDisplayParam == 'month') {
        requiredDate = new Date(d1.getMonth() - 1);
      } else if (this.selectedDisplayParam == 'day') {
        requiredDate = new Date(d1.getDate() - 1);
      } else if (this.selectedDisplayParam == 'hour') {
        requiredDate = new Date(d1.getTime() - (1000*60*60));
      } else if (this.selectedDisplayParam == 'realtime') {
        requiredDate = new Date(d1.getTime() - (1000*60*60));
      } else {
        requiredDate = new Date(d1.getTime() - (1000*60*60));
      }
      // this.widgetData.data &&
      if(this.device) {
        // let dateArray = this.getDateList(this.device.json.createdAt*1000,moment().unix()*1000, this.selectedDisplayParam)
        // dateArray.reverse()
        // let slider = this.$refs['slider']
        // this.slider.data = dateArray
        // slider.setIndex([0,1])
        this.dataToPass = {display: this.selectedDisplayParam, fromDate: requiredDate.getTime(), toDate: d2.getTime(), realtime: this.realtimeUpdate}
        this.searchDataObj = null
        this.searchDataObj = this.dataToPass
        console.log(this.dataToPass)
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
        this.dataToPass = {display: this.selectedDisplayParam, fromDate: this.slider.value[1], toDate: this.slider.value[0], realtime: this.realtimeUpdate}
        this.searchDataObj = this.dataToPass
        // console.log('slider Drag end called')
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

    // search data between dates
    searchData () {
      if(this.selectedDisplayParam == null || this.selectedDisplayParam == '' ) {
        this.selectedDisplayParam = 'hour'
      }
      let from = new Date(this.fromDate)
      let to = new Date(this.toDate)
      if (to.getTime() > this.currentTime) {
        this.$toasted.show('To data/time is not correct.').goAway(3000)
        return
      }
      if (from.getTime() > this.currentTime) {
        this.$toasted.show('From data/time is not correct.').goAway(3000)
        return
      }
      // console.log(from)
      // console.log(to)
      if(to.getTime() == from.getTime()) {
        this.realtimeUpdate = true
      } else {
        this.realtimeUpdate = false
      }
      // console.log(this.realtimeUpdate)
      if(this.chartLoaded) {
        this.dataToPass = {display: this.selectedDisplayParam, fromDate: from.getTime(), toDate: to.getTime(), realtime: this.realtimeUpdate}
        this.searchDataObj = this.dataToPass
        this.spinnerLoading = true;
        // console.log('slider Drag end called')
      }
    },

    //setting device data coming from child component
    setDeviceData (data) {
      this.chartLoaded = false
      if(data.constructor === Array && data.length > 0) {
        this.selectedDeviceDetails = this.showMultipleDevicesDetails(data)
        this.device = data
      } else {
        this.device = data
        this.selectedDeviceDetails = this.showDeviceDetails(this.device)
        let dateArray = this.getDateList(this.device.json.createdAt,moment().unix(), 'hour')
        dateArray.reverse()
        this.slider.data = dateArray
        this.chartLoaded = true
      }
    },
    // for device details
    showDeviceDetails (device) {
      let selectedDeviceDetails = '<ul>';
      selectedDeviceDetails += '<li><strong>Name:</strong>     ' + device.name + '</li>';
      selectedDeviceDetails += '<li><strong>id:</strong>       ' + device.id + '</li>';
      selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(device.json.createdAt) + '</li>';
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

    // show and hide search view on button click
    showHideSearchView () {
      this.collapsed = !this.collapsed
    },
  }
}
</script>

<style type="text/css">
#chartjs-tooltip {
  opacity: 1;
  position: absolute;
  background: rgba(0, 0, 0, .7);
  color: white;
  border-radius: 3px;
  -webkit-transition: all .1s ease;
  transition: all .1s ease;
  pointer-events: none;
  -webkit-transform: translate(-50%, 0);
  transform: translate(-50%, 0);
}
.overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 999;
    /*opacity: 0.3;*/
}
.loadingView {
  height: 30%;
  width: 40%;
  border-width: 2px;
  background-color: #ccc;
  border-radius: 3px;
  border-color: #000;
  float: none;
  margin: auto auto;
}
.loadingViewInner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    /* height: 50%; */
    width: 50%;
}
</style>