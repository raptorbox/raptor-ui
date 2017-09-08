<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-primary" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{users.length}}</h4>
            <p>Total Users</p>
          </div>
          <line-chart-total-devices class="chart-wrapper" style="height:70px;" :data="dataChartTotalUser" :labels="labelUsers" height="70"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-primary" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{devices.length}}</h4>
            <p>Total Devices</p>
          </div>
          <line-chart-total-devices class="chart-wrapper" style="height:70px;" :data="dataChartTotalDevice" :labels="labelDevs" height="70"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-info" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
          <div class="card-body pb-0">
            <h4 class="mb-0">Select a User</h4>
            <div class="float-right">
              <select class="mb-3 form-control" @change="onChangeDevice">
                <option v-for="dev in listOfDevicesForSelectOptions" v-bind:value="dev.value">{{dev.text}}</option>
              </select>
            </div>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-info" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
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
      <!-- <div class="col-sm-6 col-lg-3">
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
      </div> --><!--/.col-->
      <!-- <div class="col-sm-6 col-lg-3">
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
      </div> --><!--/.col-->
    </div><!--/.row-->

    <b-card>
      <div class="row">
        <div class="col-sm-5">
          <h4 class="card-title mb-0">{{deviceName}}</h4>
          <div class="small text-muted">{{deviceDataTime}}</div>
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
              <template>
                <div>
                  <b-form-select variant="outline-secondary"  @change.native="onChangeOptionStream" v-model="selectedStream" :options="optionsStreams" />
                </div>
              </template>
              <b-button variant="outline-secondary">Day</b-button>
              <b-button variant="outline-secondary" :active="true">Month</b-button>
              <b-button variant="outline-secondary">Year</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div><!--/.col-->
      </div><!--/.row-->
      <chart-streams class="chart-wrapper" style="height:300px;margin-top:40px;" :data="dataChartDevice" :labels="labelDevice" height="300"></chart-streams>
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
          <!-- <li>
            <div class="text-muted">Pageviews</div>
            <strong>78.706 Views (60%)</strong>
            <b-progress class="progress-xs mt-2" :precision="1" variant="warning" :value="60"></b-progress>
          </li> -->
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
  import LineChartTotalDevices from './LineChartTotalDevices'
  import CardLine2ChartExample from './CardLine2ChartExample'
  import CardLine3ChartExample from './CardLine3ChartExample'
  import CardBarChartExample from './CardBarChartExample'
  import ChartStreams from './ChartStreams'
  import SocialBoxChartExample from './SocialBoxChartExample'
  import moment from 'moment'
  import { Callout } from '../../components/'

  export default {
    name: 'dashboard',
    components: {
      Callout,
      LineChartTotalDevices,
      CardLine2ChartExample,
      CardLine3ChartExample,
      CardBarChartExample,
      ChartStreams,
      SocialBoxChartExample
    },
    data () {
      return {
        devices: 0,
        users: 0,
        labelDevs: [],
        dictUser: {},
        dataChartTotalUser: [10, 39, 10, 40, 39, 0, 0],
        dataChartTotalDevice : [],
        deviceName: "Car",
        optionsDevice: [
        { value: null,              text: 'Please select a device' },
        { value: 'memosa-wearable', text: 'Wearable' },
        { value: 'memosa-car',      text: 'Car' },
        { value: 'memosa-trip',     text: 'Trip' }
        ],
        optionsStreams: [
        { value: null,              text: 'Please select a stream' }
        ],
        listOfDevicesForSelectOptions : [{ value: null, text: 'Please select a device' }],
        selectedDevice: 'memosa-car',
        dictDevice: {},
        labelDevice: [],
        dataChartDevice: [],
        deviceDataTime : null,
        selectedStream : null,
        arrayOfDevices : [],
        labelUsers : []
      }
    },
    mounted () {
      this.fetchData()
      this.fetchUsersData()
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
      },
      fetchData () {
        this.$raptor.Inventory().list()
        .then((list) => {
          this.$log.debug('Loaded %s device list', list.length);
          this.extractChartDataDev(list);
          this.$data.labelDevs = Object.keys(this.$data.dictUser); // getting labels
          this.$data.devices = list;
          list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
          this.changeData();
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list');
          this.$log.error(e);
        });
        this.fetchDevices(this.selectedDevice);
      },
      fetchUsersData () {
        this.$log.debug('Fetching user list')
        this.$raptor.Admin().User().list()
        .then((list) => {
          this.$log.debug('Loaded %s user list', list.length)
          console.log(list)
          this.extractChartDataDev(list);
          this.labelUsers = Object.keys(this.$data.dictUser); // getting labels
          this.users = list
          this.changeDataUsers();
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list')
          this.$log.error(e)
        })
      },
      extractChartDataDeviceStream (d) {
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i];
          if(i == 0) {
            this.deviceDataTime = this.formatDate(s.timestamp * 1000);
          }
          let sDate = (new Date(s.timestamp * 1000)).getHours();
          if(!this.dictDevice[sDate]) {
            this.dictDevice[sDate] = [];
          }
          if(this.dictDevice[sDate]) {
            this.dictDevice[sDate].push(s.channels);
          }
        }
      },
      fetchDevices (val) {
        this.$raptor.Inventory().search({
          name: val
        }).then((devices) => {
          this.arrayOfDevices = devices;
          if(devices.length > 0 && devices[0]) {
            let keys = Object.keys(devices[0].json.streams);
            console.log(keys);
            this.optionsStreams = [];
            this.optionsStreams.push({ value: null,text: 'Please select a stream' });
            for (var i = 0; i < keys.length; i++) {
              this.optionsStreams.push({ value: keys[i],text: keys[i] });
            }
            this.selectedStream = keys[0];
            // this.fetchStreamData(this.selectedDevice, this.selectedStream);
          }
        });
      },
      fetchStreamData (str) {
        var ts = Math.round((new Date()).getTime() / 1000);
        for (var i = 0; i < this.arrayOfDevices.length ; i++) {
          let stream = this.arrayOfDevices[i].getStream(str);
          if(stream){
            this.$raptor.Stream().list(stream, 0, ts)
            .then((streams) => {
              this.extractChartDataDeviceStream(streams);
              if(i == this.arrayOfDevices.length) {
                this.changeStreamData();
              }
            })
            .catch((e) => {
              this.$log.debug('Failed to load streams');
              this.$log.error(e);
            });
          }
        }
      },
      changeData: function() {
        let arr = Array();
        for (var i = 0; i < this.labelUsers.length; i++) {
          let s = this.labelUsers[i];
          arr.push(this.labelUsers[s]);
        }
        this.dataChartTotalUser = arr;
      },
      changeDataUsers () {
        let arr = Array();
        for (var i = 0; i < this.labelDevs.length; i++) {
          let s = this.labelDevs[i];
          arr.push(this.dictUser[s]);
        }
        this.dataChartTotalDevice = arr;
      },
      changeStreamData: function() {
        let arr = Array();
        this.labelDevice = Object.keys(this.dictDevice); // getting labels
        for (var i = 0; i < this.labelDevice.length; i++) {
          let s = this.labelDevice[i];
          arr.push(this.dictDevice[s]);
        }
        this.dataChartDevice = arr;
      },
      onChangeDevice (evt) {
        let val = evt.target.value;
        for (var i = 0; i < this.devices.length; i++) {
          if(this.devices[i].id == val){
            let details = this.devices[i];
            this.selectedDev = details;
            this.deviceName = details.name;
            this.getSingleDevice(details);
            this.selectedDeviceDetails = '<ul>';
            this.selectedDeviceDetails += '<li><strong>Name:</strong>     ' + details.name + '</li>';
            this.selectedDeviceDetails += '<li><strong>id:</strong>       ' + details.id + '</li>';
            this.selectedDeviceDetails += '<li><strong>Created:</strong>  ' + this.formatDate(details.createdAt*1000) + '</li>';
            this.selectedDeviceDetails += '</ul>';
          }
        }
      },
      onChangeOption: function(evt) {
        let val = evt.target.value;
        this.deviceName = evt.target.text;
        this.optionsStreams = null;
        this.selectedStream = null;
        this.fetchDevices(val);
      },
      onChangeOptionStream (evt) {
        let val = evt.target.value;
        this.fetchStreamData(val);
      }
    }
  }
</script>
