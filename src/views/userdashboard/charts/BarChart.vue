<script>
import { Bar } from 'vue-chartjs'
import zoom from 'chartjs-plugin-zoom';
import moment from 'moment'

var colors = [
              'rgb(65,184,131)',
              'rgb(228,102,81)',
              'rgb(0,216,255)',
              'rgb(221,27,22)',
              'rgb(225,225,0)'
            ]
var colorsWithOpacity = [
    'rgba(65,184,131, 0.27)',
    'rgba(228,102,81, 0.27)',
    'rgba(0,216,255, 0.27)',
    'rgba(221,27,22, 0.27)',
    'rgb(225,225,0, 0.75)'
]

export default Bar.extend({
  props: ['height', 'chartData', 'width', 'searchData', 'dataPassed'],
    data() {
      return {
        dictUser: {},
        streamChartLabels: [],
        dataChartDevice: null,
        labels: [],
        device: null,
        channel: null,
        stream: null,
        dataForChart: [10, 39, 10, 40, 39, 0, 0],
        dictDevice: null,
        selectedStreamData: [],
        deviceDataTime: null,
        datasets: [],
        chartDatasets: [],
        // for slider
        selectedDisplayParam: null,
        fromDate: null,
        toDate: null,
        // records devices
        devices: [],
        receivedData: 0,
        // realtime updates
        realtimeUpdate: true,
      }
    },
    watch: {
      searchData: function(data) {
        this._chart.destroy()
        this.selectedDisplayParam = this.dataPassed.display
        this.fromDate = this.dataPassed.fromDate
        this.toDate = this.dataPassed.toDate
        // console.log(this.fromDate + "    " + this.toDate)
        this.searchDataForDates(this.fromDate, this.toDate)
      }
    },
    mounted () {
      this.addPlugin(zoom);
      // console.log(this.chartData)
      if( !(this.chartData instanceof Array) ) {
        this.device = this.chartData.device
        this.channel = this.chartData.channel
        this.stream = this.chartData.stream
        // this.subscribeStream({name: this.stream, deviceId: this.device})
        this.load()
      } else {
        this.loadDatasets()
      }
      // this.subscribeStream({name: this.stream, deviceId: this.device})
      this.renderBarChart();
    },
    created() {
      document.addEventListener('beforeunload', this.handler)
    },
    methods: {
      handler (event) {
        if(this.datasets && this.datasets.length > 0) {
          for (var j = 0; j < this.datasets.length; j++) {
            if(this.datasets[j].stream) {
              this.unsubscribeStream(this.datasets[j].stream)
            }
          }
        } else {
          this.unsubscribeStream ({name: this.stream, deviceId: this.device});
        }
      },
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY');
      },
      renderBarChart (datasets, lbls) {
        this.renderChart(
        {
          labels: lbls,
          datasets: datasets
        }, {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            xAxes: [{
              display: true,
              ticks: {
                  display: false
              },
              barPercentage: 2,
              // barThickness: 3,
              // categorySpacing: 0,
            }],
            yAxes: [{
              display: true
            }]
          },
          barValueSpacing: 2,
          // Container for pan options
          pan: {
              // Boolean to enable panning
              enabled: true,
              // Panning directions. Remove the appropriate direction to disable
              // Eg. 'y' would only allow panning in the y direction
              mode: 'x',
          },
          // Container for zoom options
          zoom: {
              // Boolean to enable zooming
              enabled: true,
              // Zooming directions. Remove the appropriate direction to disable
              // Eg. 'y' would only allow zooming in the y direction
              mode: 'x',
          }
        })
      },
      load() {
        this.$raptor.Inventory().read(this.device)
        .then((device) => {
          // console.log(device)
          this.stream = device.getStream(this.stream)
          this.subscribeStream(this.stream);
          this.$emit('devicedata', device);
          // this.getStream("obd");
        })
        .catch((e) => {
          // this.$log.debug('Failed to load device')
          // this.$log.error(e)
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (stream) {
        var context = this;
        // var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')//list(stream, 0, ts)
        .then((streams) => {
          streams.sort(function(a, b) {
            return a.timestamp - b.timestamp;
          });
          context.selectedStreamData = streams
          this.selectedStreamData = streams
          this.processSingleData()
        })
        .catch((e) => {
          // this.$log.debug('Failed to load streams')
          // this.$log.error(e)
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
        this.$raptor.Stream().subscribe(stream, function(msg) {
          // console.log(msg)
          if(context.realtimeUpdate) {
            if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {
              let last = context.selectedStreamData[context.selectedStreamData.length-1]
              if(last.timestamp != msg.record.timestamp && last.deviceId == msg.record.deviceId) {
                context.selectedStreamData.push(msg.record);
                if(context.selectedStreamData.length > 100) {
                  context.selectedStreamData.shift()
                }
                context.dataForChart = [];
                context.streamChartLabels = []
                let obj = context.extractChartDataDeviceStream(context.selectedStreamData,context.channel,context.selectedDisplayParam);
                context.dataForChart = obj.data
                context.streamChartLabels = obj.labels
                // console.log("=====================update arrived===========================")
                context._chart.data.datasets[0].data = context.dataForChart
                // context._chart.data.datasets[0] = {
                //   label: context.device.name + ' - ' + context.channel,
                //   fill: false,
                //   borderColor: colors[0],
                //   backgroundColor: colorsWithOpacity[0],
                //   data: context.dataForChart
                // }
                context._chart.data.labels = context.streamChartLabels
                context._chart.update()
                // context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
              }
            }
          }
        });
        // context.unsubscribeStream(stream)
      },
      unsubscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      },
      extractChartDataDeviceStream (d, channel, display) {
        let dataForChart = [];
        if(this.selectedDisplayParam == null || this.selectedDisplayParam == '') {
          this.selectedDisplayParam = 'hour'
        }
        let streamChartLabels = []
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          let date = new Date(s.timestamp * 1000)
          date.setSeconds(0,0)
          let sDate = date.toString(); //.toLocaleString();
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean' || (s.channels[channel] * 1)) {
            streamChartLabels.push(sDate)
            dataForChart.push(s.channels[channel])
          }
        }

        return { labels: streamChartLabels, data: dataForChart }
      },
      populateChart(labels, lbl, dataForChart) {
        let dataset = [{
          label: this.device.name + ' - ' + lbl,
          backgroundColor: colorsWithOpacity[0],
          fillColor: colors[0],
          strokeColor: "black",
          data: dataForChart
        }]
        // console.log(this._chart)
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          this._chart.destroy();
          this.renderBarChart(dataset, labels);
        }
      },
      // multiple sources
      loadDatasets() {
        this.receivedData = 0
        this.devices = []
        for (var i = 0; i < this.chartData.length; i++) {
          this.$raptor.Inventory().read(this.chartData[i].device)
          .then((device) => {
            // console.log(device)
            for (var j = 0; j < this.chartData.length; j++) {
              if(this.chartData[j].device.id == device.id) {
                let str = device.getStream(this.chartData[j].stream)
                let dev = {
                  device: device,
                  stream: str,
                  channel: this.chartData[j].channel,
                  pushed: false,
                  dataForChart: [],
                  streamChartLabels: []
                }
                let exist = this.checkDatasetExist(dev)
                if(!exist) {
                  this.datasets.push(dev)
                  this.devices.push(device)
                  if(dev.stream) {
                    this.getDataForStream(dev.stream);
                  }
                  if(this.devices.length == this.chartData.length) {
                    this.$emit('devicedata', this.devices);
                    this.initializeChart(this.datasets, this.streamChartLabels)
                    this.devices = []
                  }
                }
              }
            }
          })
          .catch((e) => {
            this.$log.debug('Failed to load device')
            // this.$log.error(e)
            // this.loading = false
            if(e.toString().indexOf("Unauthorized") !== -1) {
              this.$raptor.Auth().logout();
              this.$router.push("/pages/login");
            }
          })
        }
      },
      checkDatasetExist(dev) {
        let exist = false
        // console.log(dev)
        for (var k = 0; k < this.datasets.length; k++) {
          // console.log(this.datasets[k])
          if(this.datasets[k].device.id == dev.device.id && this.datasets[k].stream.name == dev.stream.name && dev.channel == this.datasets[k].channel) {
            exist = true
          }
        }
        return exist
      },
      initializeChart(data, labels) {
        let dsets = []
        for (var i = 0; i < data.length; i++) {
          dsets.push({
            label: data[i].device.name + ' - ' + data[i].channel,
            backgroundColor: colors[i],
            fillColor: colors[i],
            strokeColor: "black",
            data: []
          })
        }
        this.chartDatasets = dsets
        this.streamChartLabels = labels.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        })
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          this._chart.destroy()
          this.renderBarChart(this.chartDatasets, this.streamChartLabels);
        }
      },
      getDataForStream (stream) {
        // console.log(stream)
        let d = new Date();
        let requiredDate = new Date(d.getTime() - (1000*60*60)*3);
        let query = {timestamp: {between:[requiredDate.getTime(), (new Date()).getTime()]}, page:0, size:200,sort:"timestamp,DESC"}
        // this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        this.$raptor.Stream().search(stream, query)
        .then((streams) => {
          // console.log(streams)
          if(streams.length > 0) {
            this.processMultipleData(streams, false)
            this.subscribeDatasetStreams(stream)
          }
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          // this.$log.error(e)
          // this.loading = false
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      },
      processMultipleData (streams, concat) {
        for (var j = 0; j < this.datasets.length; j++) {
          if(this.datasets[j].device.id == streams[0].json.deviceId) {
            let dataset = this.datasets[j]
            if(concat) {
              dataset.selectedStreamData.concat(streams)
            }
            if(dataset.selectedStreamData == null) {
              streams.sort(function(a, b) {
                return a.timestamp - b.timestamp;
              });
            }
            this.datasets[j].selectedStreamData = streams
            let obj = this.extractChartDataDeviceStream(streams,this.datasets[j].channel, this.selectedDisplayParam);
            this.datasets[j].dataForChart = obj.data
            this.datasets[j].streamChartLabels = obj.labels
            this.sortAndRemoveDuplicats(obj.labels)
            if(!this.datasets[j].pushed) {
              this.datasets[j].pushed = true
              this.fillData()
              this._chart.data.labels = this.streamChartLabels
              if(this._chart.data.datasets[j]) {
                this._chart.data.datasets[j].data = this.datasets[j].dataForChart
              }
              this._chart.update()
            }
          }
        }
      },
      createChart(data, labels) {
        let dsets = []
        // console.log(data)
        this.chartDatasets = [{
            label: data.device.name + ' - ' + data.channel,
            backgroundColor: colorsWithOpacity[0],
            fillColor: colors[0],
            strokeColor: "black",
            data: data.dataForChart
          }]
        this.streamChartLabels = labels.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        })
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          this._chart.destroy()
          this.renderBarChart(this.chartDatasets, this.streamChartLabels);
        }
      },
      pushNewDataStreamInChart(data) {
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          let index = this._chart.data.datasets.length
          this._chart.data.datasets.push({
            label: data.device.name + ' - ' + data.channel,
            backgroundColor: colorsWithOpacity[index],
            fillColor: colors[index],
            strokeColor: "black",
            data: data.dataForChart
          })
          this._chart.update()
        }
      },
      //subscription
      subscribeDatasetStreams(stream) {
        var context = this;
        this.$raptor.Stream().subscribe(stream, function(msg) {
          // console.log(msg)
          if(context.realtimeUpdate) {
            if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {

              for (var j = 0; j < context.datasets.length; j++) {

                if(context.datasets[j].device.id == msg.device.id) {
                  let last = context.datasets[j].selectedStreamData[context.datasets[j].selectedStreamData.length-1]
                  // check timestamp of last record on this device data
                  if(last.timestamp != msg.record.timestamp) {
                    // get data and label from received msg
                    let recordData = msg.record.channels[context.datasets[j].channel]
                    let date = new Date(msg.record.timestamp * 1000)
                    date.setSeconds(0,0)
                    // console.log(date.toString())

                    // check whether labels of this devices have the new label
                    if(context.datasets[j].streamChartLabels[context.datasets[j].streamChartLabels.length-1] == date.toString()) {
                      // if yes then change the last record
                      context.datasets[j].dataForChart[context.datasets[j].dataForChart.length-1] = recordData
                      context._chart.data.datasets[j].data[context._chart.data.datasets[j].data.length-1] = recordData
                    } else {
                      // if no then
                      // push label and check it should not exceed 200 threshold
                      if(context.datasets[j].streamChartLabels.length > 200) {
                        context.datasets[j].streamChartLabels.shift()
                      }
                      context.datasets[j].streamChartLabels.push(date.toString())

                      // push data and check it should not exceed 200 threshold
                      if(context.datasets[j].dataForChart.length > 200) {
                        context.datasets[j].dataForChart.shift()
                      }
                      context.datasets[j].dataForChart.push(recordData)

                      // push null in data and new label in other devices
                      for (var i = 0; i < context.datasets.length; i++) {
                        if(i!=j) {
                          context.datasets[i].dataForChart.push(null)
                          context.datasets[i].streamChartLabels.push(date.toString())
                        }
                      }

                      context._chart.data.datasets[j].data = context.datasets[j].dataForChart
                    }
                    // push data in the streams of this device
                    context.datasets[j].selectedStreamData.push(msg.record)
                    // console.log("================")
                    // let val2 = context.streamChartLabels[context.streamChartLabels.length-2]
                    // console.log(val2)
                    let val1 = context.streamChartLabels[context.streamChartLabels.length-1]
                    // console.log(val1)
                    // console.log(context.streamChartLabels[context.streamChartLabels.length-1] != date.toString())
                    // console.log("================")
                    if(val1 != date.toString()) {
                      // push label in general labels
                      if(context.streamChartLabels.length > 200) {
                        context.streamChartLabels.shift()
                      }
                      context.streamChartLabels.push(date.toString())
                      context._chart.data.labels = context.streamChartLabels
                    }
                    context._chart.update()
                  }
                }
              }
            }
          }
        });
      },

      // search data based on timestamp for device
      searchDataForDates (startDate, endDate) {
        if(startDate == undefined || startDate == null ) {
          startDate = 0
        } else {
          // startDate = startDate+':00'
          startDate = moment(startDate).format('x');
        }
        if(endDate == undefined || endDate == null) {
          endDate = currentDate.format('x')
        } else {
          // endDate = endDate+':00'
          endDate = moment(endDate).format('x');
        }
        // "timestamp":{"between":[1510152092358,1510152094358]}
        this.receivedData = 0
        let pageNumber = 0
        this.selectedStreamData = []
        let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
        if( this.datasets.length > 0 ) {
          for (var i = 0; i < this.datasets.length; i++) {
            this.datasets[i].selectedStreamData = []
            this.datasets[i].pushed = false
            this.loopOverStreamPagination (this.datasets[i].stream, query, pageNumber, startDate, endDate)
          }
        } else {
          this.loopOverStreamPagination (this.stream, query, pageNumber, startDate, endDate)
        }
      },
      searchDataApi(stream, query, callback) {
        // console.log(query)
        // console.log(stream)
        this.$raptor.Stream().search(stream, query)
        .then((stream) => {
          console.log(stream.length)
          callback(stream)
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      },
      loopOverStreamPagination (stream, query, pageNumber, startDate, endDate) {
        let context = this
        this.searchDataApi(stream, query, function (streams) {
          if(streams && (streams[0].timestamp * 1000) < endDate && streams.length == 500) {
            pageNumber = pageNumber + 1
            let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
            if( context.datasets.length > 0) {
              for (var i = 0; i < context.datasets.length; i++) {
                if(context.datasets[i].device.id == streams[0].json.deviceId) {
                  context.datasets[i].selectedStreamData = context.datasets[i].selectedStreamData.concat(streams)
                  context.loopOverStreamPagination(context.datasets[i].stream, query, pageNumber, startDate, endDate)
                }
              }
            } else {
              context.selectedStreamData = context.selectedStreamData.concat(streams)
              context.loopOverStreamPagination(stream, query, pageNumber, startDate, endDate)
            }
          } else {
            if( context.datasets.length > 0) {
              for (var i = 0; i < context.datasets.length; i++) {
                if(context.datasets[i].device.id == streams[0].json.deviceId) {
                  context.datasets[i].selectedStreamData = context.datasets[i].selectedStreamData.concat(streams)
                  context.processMultipleData(context.datasets[i].selectedStreamData, true)
                }
              }
            } else {
              context.selectedStreamData = context.selectedStreamData.concat(streams)
              context.processSingleData()
            }
          }
        })
      },
      // sort dates
      sortDates (a,b) {
        let aDate = new Date(a);
        let bDate = new Date(b);
        return aDate.getTime() - bDate.getTime();
      },
      sortAndRemoveDuplicats (labels) {
        this.streamChartLabels = this.streamChartLabels.concat(labels)
        this.streamChartLabels = this.streamChartLabels.sort(function(a,b) {
          let aDate = new Date(a);
          let bDate = new Date(b);
          return aDate.getTime() - bDate.getTime();
        })
        this.streamChartLabels = this.streamChartLabels.filter(function(elem, index, self) {
          return index === self.indexOf(elem);
        })
      },
      fillData () {
        // console.log(this.streamChartLabels)
        for (var i = 0; i < this.streamChartLabels.length; i++) {
          for (var j = 0; j < this.datasets.length; j++) {
            if(this.datasets[j].streamChartLabels.indexOf(this.streamChartLabels[i]) === -1)  {
              this.datasets[j].streamChartLabels.splice(i, 0, this.streamChartLabels[i])
              this.datasets[j].dataForChart.splice(i, 0, undefined);
            }
          }
        }
        // console.log(this.datasets)
        return this.datasets
      },
    },
})
</script>
