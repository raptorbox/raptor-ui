<script>
import { Line } from 'vue-chartjs'
import moment from 'moment'

var currentDate = moment();

var colors = [
              'rgb(65,184,131)',
              'rgb(228,102,81)',
              'rgb(0,216,255)',
              'rgb(221,27,22)',
              'rgb(225,225,0)'
            ]
var colorsWithOpacity = [
    'rgba(65,184,131, 0.22)',
    'rgba(228,102,81, 0.22)',
    'rgba(0,216,255, 0.22)',
    'rgba(221,27,22, 0.22)',
    'rgb(225,225,0, 0.22)'
]

export default Line.extend({
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
        datasets: [],
        chartDatasets: [],
        // for slider
        selectedDisplayParam: null,
        fromDate: null,
        toDate: null,
        // records devices
        devices: [],
        receivedData: 0
      }
    },
    mounted () {
      console.log(this.chartData)
      if( !(this.chartData instanceof Array) ) {
        this.device = this.chartData.device
        this.channel = this.chartData.channel
        this.stream = this.chartData.stream
        this.load()
      } else {
        this.loadDatasets()
      }
      this.renderLineChart();
    },
    created() {
      document.addEventListener('beforeunload', this.handler)
    },
    watch: {
      searchData: function(data) {
        this._chart.destroy()
        console.log(data)
        this.selectedDisplayParam = this.dataPassed.display
        this.fromDate = this.dataPassed.fromDate
        this.toDate = this.dataPassed.toDate
        console.log(this.fromDate + "    " + this.toDate)
        this.searchDataForDates(this.fromDate, this.toDate)
      }
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
      renderLineChart (datasets, lbls) {
        this.renderChart(
        {
          labels: lbls,
          datasets: datasets
        }, {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          fullWidthGraph : true,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false
              },
              display: true,
              ticks: {
                  display: false
              },
            }],
            yAxes: [{
              display: true
            }]
          },
          // plugins: {
          //     filler: {
          //         propagate: true
          //     }
          // }
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
          this.$log.debug('Failed to load device')
          // this.$log.error(e)
          // this.loading = false
          if(e.toString().indexOf("Unauthorized") !== -1) {
            this.$raptor.Auth().logout();
            this.$router.push("/pages/login");
          }
        })
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        .then((streams) => {
          // console.log(streams)
          streams.reverse()
          this.selectedStreamData = streams
          this.dataForChart = [];
          this.streamChartLabels = []
          let obj = this.extractChartDataDeviceStream(this.selectedStreamData,this.channel, this.selectedDisplayParam);
          this.dataForChart = obj.data
          this.streamChartLabels = obj.labels
          this.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
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
        .then(() => {
          this.$raptor.Stream().subscribe(stream, function(msg) {
            if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {
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
              context._chart.data.datasets[0] = {
                label: context.channel,
                borderColor: colors[0],
                backgroundColor: colorsWithOpacity[0],
                data: context.dataForChart
              }
              context._chart.data.labels = context.streamChartLabels
              context._chart.update()
              // context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)

              // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === context.$raptor.stream)) {
              //   return
              // }
            }
          });
        })
      },
      unsubscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      },
      extractChartDataDeviceStream (d, channel, selectedDisplayParam) {
        let dataForChart = [];
        if(this.selectedDisplayParam == null || this.selectedDisplayParam == '') {
          this.selectedDisplayParam = 'hour'
        }
        let streamChartLabels = []
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          let sDate = (new Date(s.timestamp * 1000)).toUTCString();
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean' || (s.channels[channel] * 1)) {
            streamChartLabels.push(sDate)
            dataForChart.push(s.channels[channel])
          }
        }

        return { labels: streamChartLabels, data: dataForChart }
      },
      populateChart(labels, lbl, dataForChart) {
        let dataset = [{
          label: lbl,
          borderColor: colors[0],
          backgroundColor: colorsWithOpacity[0],
          strokeColor: 'rgba(220,180,0,1)',
          pointColor: 'rgba(220,180,0,1)',
          data: dataForChart
        }]
        // console.log(this._chart)
        this._chart.destroy();
        this.renderLineChart(dataset, labels);
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
              // console.log(this.chartData[j].device.id)
              // console.log(device.id)
              // console.log(this.chartData[j].device.id == device.id)
              if(this.chartData[j].device.id == device.id) {
                let str = device.getStream(this.chartData[j].stream)
                let dev = {
                  device: device,
                  stream: str,
                  channel: this.chartData[j].channel,
                  pushed: false
                }
                let exist = this.checkDatasetExist(dev)
                if(!exist) {
                  this.datasets.push(dev)
                  this.devices.push(device)
                  if(dev.stream) {
                    this.subscribeDatasetStreams(dev.stream);
                  }
                  if(this.devices.length == this.chartData.length) {
                    this.$emit('devicedata', this.devices);
                    this.devices = []
                  }
                }
              }
            }
            // console.log(this.devices)
            // this.getStream("obd");
            // console.log(this.datasets)
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
      subscribeDatasetStreams (stream) {
        // console.log(stream)
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        .then((streams) => {
          // console.log(streams)
          if(streams.length > 0) {
            for (var j = 0; j < this.datasets.length; j++) {
              if(this.datasets[j].device.id == streams[0].json.deviceId) {
                streams.reverse()
                this.datasets[j].selectedStreamData = streams
                let obj = this.extractChartDataDeviceStream(streams,this.datasets[j].channel, this.selectedDisplayParam);
                this.datasets[j].dataForChart = obj.data
                this.datasets[j].streamChartLabels = obj.labels
                this.streamChartLabels = obj.labels
                if(this.receivedData == 0) {
                  this.datasets[j].pushed = true
                  this.createChart(this.datasets[j], this.streamChartLabels)
                  this.subsciptionOfStreamForMultipleData(this.datasets[j].stream)
                } else {
                  if(!this.datasets[j].pushed) {
                    this.datasets[j].pushed = true
                    this.pushNewDataStreamInChart(this.datasets[j])
                    this.subsciptionOfStreamForMultipleData(this.datasets[j].stream)
                  }
                }
                this.receivedData++
              }
            }
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
      createChart(data, labels) {
        let dsets = []
        this.chartDatasets = [{
            label: data.channel,
            // fill: false,
            borderColor: colors[0],
            backgroundColor: colorsWithOpacity[0],
            strokeColor: 'rgba(220,180,0,1)',
            pointColor: 'rgba(220,180,0,1)',
            data: data.dataForChart
          }]
        this.streamChartLabels = labels.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        })
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          // this._chart.data.datasets = this.chartDatasets
          // this._chart.data.labels = this.streamChartLabels
          // this._chart.update()
          this._chart.destroy()
          console.log(this.chartDatasets)
          this.renderLineChart(this.chartDatasets, this.streamChartLabels);
        }
      },
      pushNewDataStreamInChart(data) {
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          let index = this._chart.data.datasets.length
          this._chart.data.datasets.push({
            label: data.channel,
            // fill: false,
            borderColor: colors[index],
            backgroundColor: colorsWithOpacity[index],
            strokeColor: 'rgba(220,180,0,1)',
            pointColor: 'rgba(220,180,0,1)',
            data: data.dataForChart
          })
          this._chart.update()
        }
      },
      //subscription
      subsciptionOfStreamForMultipleData(stream) {
        var context = this;
        this.$raptor.Stream().subscribe(stream, function(msg) {
          console.log(msg)
          if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {
            let dsets = []
            for (var j = 0; j < context.datasets.length; j++) {
              if(context.datasets[j].device.id == msg.device.id) {
                if(context.datasets[j].selectedStreamData.indexOf(msg.record) == -1) {
                  context.datasets[j].selectedStreamData.push(msg.record)
                  if(context.datasets[j].selectedStreamData.length > 100) {
                    context.datasets[j].selectedStreamData.shift()
                  }
                  let obj = context.extractChartDataDeviceStream(context.datasets[j].selectedStreamData,context.datasets[j].channel,context.selectedDisplayParam);
                  context.datasets[j].dataForChart = [];
                  context.datasets[j].streamChartLabels = []
                  context.datasets[j].dataForChart = obj.data
                  context.datasets[j].streamChartLabels = obj.labels
                  context.streamChartLabels = obj.labels
                  console.log(context._chart.data)
                  context._chart.data.datasets[j] = {
                    label: context.datasets[j].channel,
                    borderColor: colors[j],
                    backgroundColor: colorsWithOpacity[j],
                    data: context.datasets[j].dataForChart
                  }
                  context._chart.data.labels = context.streamChartLabels
                  context._chart.update()
                }
              }
            }
            // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
            //   return
            // }
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
        let pageNumber = 0
        this.selectedStreamData = []
          let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
          // console.log(query)
          // console.log(stream)
          this.loopOverStreamPagination (this.stream, query, pageNumber, startDate, endDate)
      },
      searchDataApi(stream, query, callback) {
        // console.log(query)
        // console.log(stream)
        this.$raptor.Stream().search(stream, query)
        .then((stream) => {
          // console.log(stream.length)
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
          if(streams.length > 0 && (streams[0].timestamp * 1000) < endDate) {
            for (var i = 0; i < streams.length; i++) {
              context.selectedStreamData.push(streams[i])
            }
            pageNumber = pageNumber + 1
            let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,DESC"}
            context.loopOverStreamPagination(stream, query, pageNumber, startDate, endDate)
          } else {
            for (var i = 0; i < streams.length; i++) {
              context.selectedStreamData.push(streams[i])
            }
            context.dataForChart = [];
            context.streamChartLabels = []
            let obj = context.extractChartDataDeviceStream(context.selectedStreamData,context.channel, context.selectedDisplayParam);
            context.dataForChart = obj.data
            context.streamChartLabels = obj.labels
            context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
          }
        })
      },
    },
})
</script>
