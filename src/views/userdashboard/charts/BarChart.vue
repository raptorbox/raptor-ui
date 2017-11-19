<script>
import { Bar } from 'vue-chartjs'
import moment from 'moment'

var colors = [
              '#41B883',
              '#E46651',
              '#00D8FF',
              '#DD1B16',
              '#FFFF00'
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
      }
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
    mounted () {
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
          responsive: false,
          maintainAspectRatio: true,
          scales: {
            xAxes: [{
              display: false,
              barPercentage: 2
            }],
            yAxes: [{
              display: true
            }]
          },
          barValueSpacing: 2
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
          this.$log.error(e)
          this.loading = false
        })
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (stream) {
        var context = this;
        // var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')//list(stream, 0, ts)
        .then((streams) => {
          // console.log(streams)
          // context.selectedStreamData = streams
          // context.extractChartDataDeviceStream(context.selectedStreamData,context.channel);
          streams.reverse()
          context.selectedStreamData = streams
          this.dataForChart = [];
          this.streamChartLabels = []
          let obj = context.extractChartDataDeviceStream(context.selectedStreamData,context.channel);
          this.dataForChart = obj.data
          this.streamChartLabels = obj.labels
          this.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
        })
        this.$raptor.Stream().subscribe(stream, function(msg) {
          console.log(msg)
          if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {
            context.selectedStreamData.push(msg.record);
            if(context.selectedStreamData.length > 100) {
              context.selectedStreamData.shift()
            }
            context.dataForChart = [];
            context.streamChartLabels = []
            context.selectedStreamData.push(msg.record);
            let obj = context.extractChartDataDeviceStream(context.selectedStreamData,context.channel);
            context.dataForChart = obj.data
            context.streamChartLabels = obj.labels
            context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
            // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
            //   return
            // }
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
          let sDate = (new Date(s.timestamp * 1000)).toUTCString();
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean') {
            streamChartLabels.push(sDate)
            dataForChart.push(s.channels[channel])
          }
        }

        return { labels: streamChartLabels, data: dataForChart }
      },
      populateChart(labels, lbl, dataForChart) {
        let dataset = [{
          label: lbl,
          backgroundColor: '#f87979',
          borderColor: '#f87979',
          borderWidth: 2,
          data: dataForChart
        }]
        this._chart.destroy();
        this.renderBarChart(dataset, labels);
      },
      // for multiple datasets
      loadDatasets() {
        for (var i = 0; i < this.chartData.length; i++) {
          this.$raptor.Inventory().read(this.chartData[i].device)
          .then((device) => {
            // console.log(device)
            for (var j = 0; j < this.chartData.length; j++) {
              if(this.chartData[j].device == device.id) {
                let dev = {
                  device: device,
                  stream: device.getStream(this.chartData[j].stream),
                  channel: this.chartData[j].channel
                }
                this.datasets.push(dev)
                this.subscribeDatasetStreams(dev.stream);
              }
            }
            // this.getStream("obd");
          })
          .catch((e) => {
            this.$log.debug('Failed to load device')
            this.$log.error(e)
            this.loading = false
          })
        }
      },
      subscribeDatasetStreams (stream) {
        console.log(stream)
        // var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')//list(stream, 0, ts)
        .then((streams) => {
          console.log(streams)
          if(streams.length > 0) {
            for (var j = 0; j < this.datasets.length; j++) {
              console.log(streams[0].json.deviceId + " " + this.datasets[j].device.id)
              if(this.datasets[j].device.id == streams[0].json.deviceId) {
                streams.reverse()
                this.datasets[j].selectedStreamData = streams
                let obj = this.extractChartDataDeviceStream(streams,this.datasets[j].channel);
                console.log(obj)
                this.datasets[j].dataForChart = obj.data
                this.datasets[j].streamChartLabels = obj.labels
                this.streamChartLabels = this.streamChartLabels.concat(obj.labels)
              }
            }
          }
          // console.log(this.datasets)
          // let dsets = []
          // for (var i = 0; i < this.datasets.length; i++) {
          //   if( this.datasets[i].device == streams[0].json.deviceId ) {
          //     if(this.chartDatasets[i].label == this.datasets[i].channel) {
          //       this.chartDatasets[i].data = this.datasets[i].dataForChart
          //     } else {
          //       this.chartDatasets.push({
          //         label: this.datasets[i].channel,
          //         backgroundColor: colors[i],
          //         data: this.datasets[i].data
          //       })
          //     }
          //   }
          // }
          // this.renderLineChart(this.chartDatasets, this.streamChartLabels);
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
          this.loading = false
        })
        .then(() => {
          let dsets = []
          for (var i = 0; i < this.datasets.length; i++) {
            dsets.push({
              label: this.datasets[i].channel,
              // fill: false,
              borderColor: colors[i],
              backgroundColor: colors[i],
              borderWidth: 2,
              data: this.datasets[i].dataForChart
            })
          }
          this.chartDatasets = dsets
          let lbls = this.streamChartLabels
          this.streamChartLabels = lbls.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
          })
          this._chart.destroy();
          this.renderBarChart(this.chartDatasets, this.streamChartLabels);
        })
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
          endDate = Date.now()
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
        console.log(query)
        console.log(stream)
        this.$raptor.Stream().search(stream, query)
        .then((stream) => {
          // console.log(stream.length)
          callback(stream)
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
        })
      },
      loopOverStreamPagination (stream, query, pageNumber, startDate, endDate) {
        let context = this
        this.searchDataApi(stream, query, function (streams) {
          // console.log(streams[0])
          // console.log(streams[0].timestamp * 1000)
          // console.log(endDate)
          // console.log((streams[0].timestamp * 1000) > endDate)
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
            console.log(context.selectedStreamData)
            context.dataForChart = [];
            context.streamChartLabels = []
            let obj = context.extractChartDataDeviceStream(context.selectedStreamData,context.channel, context.selectedDisplayParam);
            context.dataForChart = obj.data
            context.streamChartLabels = obj.labels
            console.log(obj)
            context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
          }
        })
      },
    },
})
</script>
