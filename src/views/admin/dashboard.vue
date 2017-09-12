<template>
  <div class="animated fadeIn">
    <div class="row">
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-primary" :no-block="true" style="min-height:200px; max-height:200px; height:200px">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{users.length}}</h4>
            <p>Total Users</p>
          </div>
          <line-chart-total-users class="chart-wrapper" style="height:80px;" :data="dataChartTotalUser" :labels="labelUsers" height="80"/>
        </b-card>
      </div><!--/.col-->
      <!-- <div class="col-sm-6 col-lg-3">
        <b-card class="bg-primary" :no-block="true" style="min-height:200px; max-height:200px; height:200px">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{devices.length}}</h4>
            <p>Total Devices</p>
          </div>
          <line-chart-total-devices class="chart-wrapper" style="height:80px;" :data="dataChartTotalDevice" :labels="labelDevs" height="80"/>
        </b-card>
      </div> --><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-success" :no-block="true" style="min-height:200px; max-height:200px; height:200px">
          <div class="card-body pb-0">
            <h4 class="mb-0">{{devices.length}}</h4>
            <p>Total Devices</p>
          </div>
          <bar-chart-total-devices class="chart-wrapper px-3" style="height:80px;" :data="dataChartTotalDevice" :labels="labelDevs" height="80"/>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-info" :no-block="true" style="min-height:200px; max-height:200px; height:200px">
          <div class="card-body pb-0">
            <h4 class="mb-0 float-left">Select a User</h4>
            <div class="float-right">
              <select class="mb-3 form-control" @change="onChangeUser">
                <option v-for="u in listOfUsersForSelectOptions" v-bind:value="u.value">{{u.text}}</option>
              </select>
            </div>
          </div>
          <div class="pb-0">
            <span v-html="selectedUserDetails"></span>
          </div>
        </b-card>
      </div><!--/.col-->
      <div class="col-sm-6 col-lg-3">
        <b-card class="bg-success" :no-block="true" style="min-height:200px; max-height:200px; height:200px">
          <div class="card-body pb-0">
            <h4 class="mb-0 float-left">Select a Device</h4>
            <div class="float-right">
              <select class="mb-3 form-control" @change="onChangeDevice">
                <option v-for="dev in listOfDevicesForSelectOptions" v-bind:value="dev.value">{{dev.text}}</option>
              </select>
            </div>
          </div>
          <div class="pb-0">
            <span v-html="selectedDeviceDetails"></span>
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
          <!-- <b-button type="button" variant="primary" class="float-right"><i class="icon-cloud-download"></i></b-button> -->
          <b-button-toolbar class="float-right" aria-label="Toolbar with button groups">
            <b-button-group class="mr-3" aria-label="First group">
              <!-- <template>
                <div>
                  <b-form-select variant="outline-secondary"  @change.native="onChangeOption" v-model="selectedDevice" :options="optionsDevice" />
                </div>
              </template> -->
              <b-button variant="outline-secondary" value="minutes" @click="onChangeDisplayDataTime">Minutes</b-button>
              <b-button variant="outline-secondary" value="hours" @click="onChangeDisplayDataTime">Hours</b-button>
              <b-button variant="outline-secondary" value="day" @click="onChangeDisplayDataTime">Day</b-button>
              <b-button variant="outline-secondary" value="month" @click="onChangeDisplayDataTime">Month</b-button>
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
      <chart-streams class="chart-wrapper" style="height:300px;margin-top:40px;" :data="dataChartDevice" :labels="labelDevice" height="300"></chart-streams>
      <div slot="footer">
        <span v-html="streamChartDetails"></span>
      </div>
    </b-card>
  </div>
</template>

<script>
  import LineChartTotalDevices from './LineChartTotalDevices'
  import LineChartTotalUsers from './LineChartTotalUsers'
  import BarChartTotalDevices from './BarChartTotalDevices'
  import ChartStreams from './ChartStreams'
  import moment from 'moment'

  export default {
    name: 'dashboard',
    components: {
      LineChartTotalDevices,
      LineChartTotalUsers,
      BarChartTotalDevices,
      ChartStreams
    },
    data () {
      return {
        devices: 0,
        users: 0,
        selectedDevicesForUser: [],
        labelDevs: [],
        dictUser: {},
        dictDev: {},
        dataChartTotalUser: [],
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
        listOfUsersForSelectOptions : [{ value: null, text: 'Please select a User' }],
        selectedDevice: 'memosa-car',
        dictDevice: {},
        labelDevice: [],
        dataChartDevice: [],
        deviceDataTime : null,
        selectedStream : null,
        arrayOfDevices : [],
        labelUsers : [],
        streamChartLabels: [],
        selectedStreamData: null,
        totalNoOfDevices : 0,
        colorVarients: ['green','blue','lightblue','yellow','red','pink','black','purple','cyan','orange','brown'],
        selectedUserDetails: null,
        selectedDeviceDetails: null,
        streamChartDetails: null,
        selectedChannel: null,
        optionsChannel: [{ value: null, text: 'Please select a Channel' }],
        selectedDev: null
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
          let sDate = this.formatDate(s.createdAt * 1000).split(' ')[0]
          this.$data.dictDev[sDate] = this.$data.dictDev[sDate] ? this.$data.dictDev[sDate] + 1 : 1;
        }
      },
      extractChartDataUser (d) {
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i]
          let sDate = this.formatDate(s.created).split(' ')[0]
          this.$data.dictUser[sDate] = this.$data.dictUser[sDate] ? this.$data.dictUser[sDate] + 1 : 1;
        }
      },
      fetchData () {
        this.$raptor.Inventory().list()
        .then((list) => {
          this.$log.debug('Loaded %s device list', list.length);
          console.log(list)
          this.extractChartDataDev(list);
          this.$data.labelDevs = Object.keys(this.$data.dictDev); // getting labels
          this.$data.devices = list;
          // list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
          this.changeData();
        })
        .catch((e) => {
          this.$log.debug('Failed to load device list');
          this.$log.error(e);
        });
        // this.fetchDevices(this.selectedDevice);
      },
      fetchUsersData () {
        this.$log.debug('Fetching user list')
        this.$raptor.Admin().User().list()
        .then((list) => {
          this.$log.debug('Loaded %s user list', list.length)
          console.log(list)
          this.extractChartDataUser(list);
          this.labelUsers = Object.keys(this.$data.dictUser); // getting labels
          this.users = list
          list.forEach( (e) => this.listOfUsersForSelectOptions.push({value: e.uuid, text: e.username}));
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
      extractChartDataDeviceStream (d, val) {
        this.dictDevice = [];
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          if(i == 0) {
            this.deviceDataTime = this.formatDate(s.timestamp * 1000);
          }
          let sDate = (new Date(s.timestamp * 1000)).getMinutes();
          if(val == 'hours'){
            sDate = (new Date(s.timestamp * 1000)).getHours();
          } else if(val == 'day'){
            sDate = (new Date(s.timestamp * 1000)).getDay();
          } else if(val == 'month'){
            sDate = (new Date(s.timestamp * 1000)).getMonth();
          }
          if(!this.dictDevice[sDate]) {
            this.dictDevice[sDate] = [];
          }
          if(this.dictDevice[sDate]) {
            this.dictDevice[sDate].push(s.channels);
          }
        }
      },
      extractChartDataDeviceStreamOneChannel (d, val, channel) {
        this.dictDevice = [];
        // console.log(d)
        // console.log(channel)
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          if(i == 0) {
            this.deviceDataTime = this.formatDate(s.timestamp * 1000);
          }
          let sDate = (new Date(s.timestamp * 1000)).getMinutes();
          if(val == 'hours'){
            sDate = (new Date(s.timestamp * 1000)).getHours();
          } else if(val == 'day'){
            sDate = (new Date(s.timestamp * 1000)).getDay();
          } else if(val == 'month'){
            sDate = (new Date(s.timestamp * 1000)).getMonth();
          }
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean') {
            if(!this.dictDevice[sDate]) {
              this.dictDevice[sDate] = [];
            }
            if(this.dictDevice[sDate]) {
              this.dictDevice[sDate].push(s.channels[channel]);
            }
          } else {
            alert("Only numbers and booleans are allowed");
            break;
          }
        }
        // console.log("=============================================")
        // console.log(this.dictDevice)
      },
      fetchDevices (condition) {
        //{name: val}
        this.$raptor.Inventory().search(condition).then((devices) => {
          this.arrayOfDevices = devices;
          devices.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
          // console.log(devices);
          console.log(this.listOfDevicesForSelectOptions);
          if(devices.length > 0 && devices[0]) {
            let keys = Object.keys(devices[0].json.streams);
            // console.log(keys);
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
      getSingleDevice (device) {
        if(device) {
          let keys = Object.keys(device.json.streams);
          // console.log(keys);
          this.optionsStreams = [];
          this.optionsStreams.push({ value: null,text: 'Please select a stream' });
          for (var i = 0; i < keys.length; i++) {
            this.optionsStreams.push({ value: keys[i],text: keys[i] });
          }
          this.selectedStream = keys[0];
        }
      },
      fetchStreamData (str) {
        // console.log(str)
        // var ts = Math.round((new Date()).getTime() / 1000);
        // for (var i = 0; i < this.arrayOfDevices.length ; i++) {
        //   let stream = this.arrayOfDevices[i].getStream(str);
        //   if(stream){
        //     this.$raptor.Stream().list(stream, 0, ts)
        //     .then((streams) => {
        //       this.extractChartDataDeviceStream(streams);
        //       if(i == this.arrayOfDevices.length) {
        //         this.changeStreamData();
        //       }
        //     })
        //     .catch((e) => {
        //       this.$log.debug('Failed to load streams');
        //       this.$log.error(e);
        //     });
        //   }
        // }
        var ts = Math.round((new Date()).getTime() / 1000);
        let stream = this.selectedDev.getStream(str);
        if(stream){
          this.$raptor.Stream().list(stream, 0, ts)
          .then((streams) => {
            // console.log(JSON.stringify(streams));
            this.selectedStreamData = streams;
            // this.extractChartDataDeviceStream(streams,'minutes');
            // this.changeStreamData();
          })
          .catch((e) => {
            this.$log.debug('Failed to load streams');
            this.$log.error(e);
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
      getUserDevices (userId) {
        // this.fetchDevices({properties: {userId}});
        this.listOfDevicesForSelectOptions = [{ value: null, text: 'Please select a device' }]
        this.selectedDevicesForUser = [];
        for (var i = 0; i < this.devices.length; i++) {
          let dev = this.devices[i];
          if(dev.userId == userId) {
            this.listOfDevicesForSelectOptions.push({value: dev.id, text: dev.name +' - '+ dev.id})
            this.selectedDevicesForUser.push(dev);
          }
        }
      },
      changeData () {
        let arr = Array();
        for (var i = 0; i < this.labelDevs.length; i++) {
          let s = this.labelDevs[i];
          arr.push(this.dictDev[s]);
        }
        this.dataChartTotalDevice = arr;
      },
      changeDataUsers () {
        let arr = Array();
        for (var i = 0; i < this.labelUsers.length; i++) {
          let s = this.labelUsers[i];
          arr.push(this.dictUser[s]);
        }
        this.dataChartTotalUser = arr;
      },
      changeStreamData: function() {
        let arr = Array();
        this.labelDevice = Object.keys(this.dictDevice); // getting labels
        for (var i = 0; i < this.labelDevice.length; i++) {
          let s = this.labelDevice[i];
          arr.push(this.dictDevice[s]);
        }
        // console.log(arr)
        this.dataChartDevice = arr;
      },
      onChangeUser (evt) {
        let val = evt.target.value;
        for (var i = 0; i < this.users.length; i++) {
          if(this.users[i].uuid == val){
            let user = this.users[i];
            this.getUserDevices(user.uuid);
            this.selectedUserDetails = '<ul>';
            this.selectedUserDetails += '<li><strong>UUID:</strong>       ' + user.uuid + '</li>';
            this.selectedUserDetails += '<li><strong>Email:</strong>     ' + user.email + '</li>';
            this.selectedUserDetails += '<li><strong>Role:</strong>       ' + JSON.stringify(user.roles) + '</li>';
            this.selectedUserDetails += '<li><strong>Created:</strong>  ' + this.formatDate(user.created) + '</li>';
            this.selectedUserDetails += '<li><strong>Devices:</strong>  ' + this.selectedDevicesForUser.length + '</li>';
            this.selectedUserDetails += '</ul>';
          }
        }
      },
      onChangeDevice (evt) {
        let val = evt.target.value;
        for (var i = 0; i < this.selectedDevicesForUser.length; i++) {
          if(this.selectedDevicesForUser[i].id == val){
            let details = this.selectedDevicesForUser[i];
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
        if(this.selectedDev) {
          // console.log(this.selectedDev.json.streams)
          let ch = this.selectedDev.json.streams[val];
          let keys = Object.keys(ch.channels);
          // console.log(keys);
          this.optionsChannel = [];
          this.optionsChannel.push({ value: null,text: 'Please select a Channel' });
          for (var i = 0; i < keys.length; i++) {
            this.optionsChannel.push({ value: keys[i],text: keys[i] });
          }
          // this.selectedChannel = keys[0];
          this.fetchStreamData(val);
        }
      },
      onChangeDisplayDataTime (evt) {
        let val = evt.target.value;
        // console.log(this.selectedChannel)
        if(this.selectedStreamData && this.selectedChannel) {
          this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData, val, this.selectedChannel);
          this.changeStreamData();
        }
      },
      onChangeOptionChannel (evt) {
        let val = evt.target.value;
        // console.log(val)
        /*if(this.selectedDev) {
          // console.log(this.selectedDev.json.streams)
          let ch = this.selectedDev.json.streams[val];
          let keys = Object.keys(ch.channels);
          for (var i = 0; i < keys.length; i++) {
            if(keys[i] == val){
              if(ch.channels[val].type != "")
            }
          }
          // this.selectedChannel = keys[0];
          this.fetchStreamData(val);
        }*/
        this.dictDevice = [];
        if(this.selectedStreamData) {
          // this.getChannelsDetails(Object.keys(this.selectedStreamData.channels));
          // console.log(this.selectedStreamData)
          this.extractChartDataDeviceStreamOneChannel(this.selectedStreamData,'minutes',val);
          this.changeStreamData();
        }
      }
    }
  }
</script>
