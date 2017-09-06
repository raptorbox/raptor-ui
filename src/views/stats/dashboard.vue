<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-primary" :no-block="true">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{devices}}</h4>
            <p>Total Devices</p>
          </div>
          <card-line1-chart-example class="chart-wrapper" style="height:70px;" :data="dataChartUser" :labels="label" height="70"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-info" :no-block="true">
          <div class="card-body pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <h4 class="mb-0">9.823</h4>
            <p>Members online</p>
          </div>
          <card-line2-chart-example class="chart-wrapper px-3" style="height:70px;" height="70"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-warning" :no-block="true">
          <div class="card-body pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <h4 class="mb-0">9.823</h4>
            <p>Members online</p>
          </div>
          <card-line3-chart-example class="chart-wrapper" style="height:70px;" height="70"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-danger" :no-block="true">
          <div class="card-body pb-0">
            <b-dropdown class="float-right" variant="transparent p-0" right>
              <template slot="button-content">
                <i class="icon-settings"></i>
              </template>
              <b-dropdown-item>Action</b-dropdown-item>
              <b-dropdown-item>Another action</b-dropdown-item>
              <b-dropdown-item>Something else here...</b-dropdown-item>
              <b-dropdown-item disabled>Disabled action</b-dropdown-item>
            </b-dropdown>
            <h4 class="mb-0">9.823</h4>
            <p>Members online</p>
          </div>
          <card-bar-chart-example class="chart-wrapper px-3" style="height:70px;" height="70"/>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->

    <b-card>
      <div class="row">
        <div class="col-sm-5">
          <h4 class="card-title mb-0">{{deviceName}}</h4>
          <div class="small text-muted">November 2016</div>
        </div><!--/.col-->
        <div class="col-sm-7 hidden-sm-down">
          <b-button type="button" variant="primary" class="float-right"><i class="icon-cloud-download"></i></b-button>
          <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button-group class="mr-3" aria-label="First group">
              <template>
                <div>
                  <b-form-select variant="outline-secondary"  @change.native="onChangeOption" v-model="selectedDevice" :options="optionsDevice" />
                </div>
              </template>
              <b-button variant="outline-secondary">Day</b-button>
              <b-button variant="outline-secondary" :active="true">Month</b-button>
              <b-button variant="outline-secondary">Year</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div><!--/.col-->
      </div><!--/.row-->
      <main-chart-example class="chart-wrapper" style="height:300px;margin-top:40px;" :data="dataChartDevice" :labels="labelDevice" height="300"></main-chart-example>
      <div slot="footer">
        <ul>
          <li>
            <div class="text-muted">Visits</div>
            <strong>29.703 devices (40%)</strong>
            <b-progress class="progress-xs mt-2" :precision="1" variant="success" :value="40"></b-progress>
          </li>
          <li class="hidden-sm-down">
            <div class="text-muted">Unique</div>
            <strong>24.093 devices (20%)</strong>
            <b-progress class="progress-xs mt-2" :precision="1" variant="info" :value="20"></b-progress>
          </li>
          <li>
            <div class="text-muted">Pageviews</div>
            <strong>78.706 Views (60%)</strong>
            <b-progress class="progress-xs mt-2" :precision="1" variant="warning" :value="60"></b-progress>
          </li>
          <li class="hidden-sm-down">
            <div class="text-muted">New devices</div>
            <strong>22.123 devices (80%)</strong>
            <b-progress class="progress-xs mt-2" :precision="1" variant="danger" :value="80"></b-progress>
          </li>
          <li class="hidden-sm-down">
            <div class="text-muted">Bounce Rate</div>
            <strong>40.15%</strong>
            <b-progress class="progress-xs mt-2" :precision="1" :value="40"></b-progress>
          </li>
        </ul>
      </div>
    </b-card>
  </div>
</template>

<script>
  import CardLine1ChartExample from './CardLine1ChartExample'
  import CardLine2ChartExample from './CardLine2ChartExample'
  import CardLine3ChartExample from './CardLine3ChartExample'
  import CardBarChartExample from './CardBarChartExample'
  import MainChartExample from './MainChartExample'
  import SocialBoxChartExample from './SocialBoxChartExample'
  import moment from 'moment'
  import { Callout } from '../../components/'

  export default {
    name: 'dashboard',
    components: {
      Callout,
      CardLine1ChartExample,
      CardLine2ChartExample,
      CardLine3ChartExample,
      CardBarChartExample,
      MainChartExample,
      SocialBoxChartExample
    },
    data () {
      return {
        devices: 0,
        label: [],
        dictUser: {},
        dataChartUser: [10, 39, 10, 40, 39, 0, 0],
        deviceName: "Memosa-Wearable",
        optionsDevice: [
        { value: null,              text: 'Please select some item' },
        { value: 'memosa-wearable', text: 'Wearable' },
        { value: 'memosa-car',      text: 'Car' },
        { value: 'memosa-trip',     text: 'Trip' }
        ],
        selectedDevice: null,
        dictDevice: {},
        labelDevice: [],
        dataChartDevice: []
      }
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY');
      },
      extractChartDataDev (d) {
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i]
          let sDate = this.formatDate(s.createdAt * 10000).split(' ')[0]
          this.$data.dictUser[sDate] = this.$data.dictUser[sDate] ? this.$data.dictUser[sDate] + 1 : 1;
        }
        // console.log(JSON.stringify(this.$data.dictUser))
      },
      fetchData () {
        /*this.$log.debug('Fetching user list');
        this.$raptor.Admin().User().list()
        .then((list) => {
          this.$log.debug('Loaded %s user list', list.length);
          this.extractChartDataDev(list);
          this.$data.label = Object.keys(this.$data.dictUser); // getting labels
          console.log(list);
          this.$data.devices = list.length;
          this.changeData();
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list');
          this.$log.error(e);
        });*/
        this.$log.debug('Fetching devices list');
        this.$raptor.Inventory().list()
        .then((list) => {
          this.$log.debug('Loaded %s device list', list.length);
          this.extractChartDataDev(list);
          this.$data.label = Object.keys(this.$data.dictUser); // getting labels
          // console.log("labels for devices " + this.$data.label);
          console.log(list);
          this.$data.devices = list.length;
          this.changeData();
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list');
          this.$log.error(e);
        });

        this.fetchStreamData("memosa-wearable");
      },
      extractChartDataDeviceStream (d) {
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i]
          let sDate = (new Date(s.timestamp)).getHours();
          if(!this.dictDevice[sDate]) {
            this.dictDevice[sDate] = [];
          }
          // console.log(s + " " + sDate + " " + this.dictDevice[sDate]);
          if(this.dictDevice[sDate]) {
            this.dictDevice[sDate].push(s.channels);
          }
        }
        // console.log(JSON.stringify(this.$data.dictDevice))
      },
      fetchStreamData (val) {
        var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Inventory().search({
          name: val
        }).then((devices) => {
          // console.log("device count: " + devices.length);
          for (var i = 0; i < devices.length ; i++) {
            let stream = devices[i].getStream('stats');
            console.log(stream);
            if(stream){
              this.$raptor.Stream().list(stream, 0, ts)
              .then((streams) => {
              // console.log("stats " + JSON.stringify(streams));
              this.extractChartDataDeviceStream(streams);
              // for (var i = 0; i < streams.length - 1 ; i++) {
              //   let channels = streams[i].channels;
              //   console.log(JSON.stringify(channels));
              // }
              // console.log("is it " + i + " " + devices.length);
              if(i == devices.length) {
                this.changeStreamData();
              }
            })
              .catch((e) => {
                this.$log.debug('Failed to load streams');
                this.$log.error(e);
              });
            /*stream = devices[i].getStream('wearable');
            this.$raptor.Stream().list(stream, 0, ts)
            .then((streams) => {
              console.log("wearable " + JSON.stringify(streams));
            })
            .catch((e) => {
              this.$log.debug('Failed to load streams');
              this.$log.error(e);
            });*/
          }
        }
      });
      },
      changeData: function() {
        let arr = Array();
        for (var i = 0; i < this.label.length; i++) {
          let s = this.label[i];
          arr.push(this.dictUser[s]);
        }
        // console.log("labels " + this.label + " data "+ arr);
        this.dataChartUser = arr;
      },
      changeStreamData: function() {
        let arr = Array();
        console.log("fired");
        this.labelDevice = Object.keys(this.dictDevice); // getting labels
        // console.log("labels " + this.labelDevice)
        // console.log("objects " + JSON.stringify(this.dictDevice));
        for (var i = 0; i < this.labelDevice.length; i++) {
          let s = this.labelDevice[i];
          // console.log("label " + s + " obj " + this.dictDevice[s]);
          arr.push(this.dictDevice[s]);
        }
        console.log("final array " + JSON.stringify(arr));
        this.dataChartDevice = arr;
      },
      onChangeOption: function(evt) {
        let val = evt.target.value
        console.log(val)
        // this.fetchStreamData(val);
      }
    }
  }
</script>
