<script>
import { Line } from 'vue-chartjs'
import moment from 'moment'

var colors = [
              '#41B883',
              '#E46651',
              '#00D8FF',
              '#DD1B16',
              '#FFFF00'
            ]

export default Line.extend({
  props: ['height', 'chartData', 'width'],
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
      }
    },
    mounted () {
      // console.log(this.chartData)
      if( !(this.chartData instanceof Array) ) {
        this.device = this.chartData.device
        this.channel = this.chartData.channel
        this.stream = this.chartData.stream
        this.load()
      } else {
        this.loadDatasets()
      }
      // this.subscribeStream({name: this.stream, deviceId: this.device})
      this.renderLineChart();
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
      renderLineChart (datasets, lbls) {
        this.renderChart(
        {
          labels: lbls,
          datasets: datasets
        }, {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: false,
              gridLines: {
                display: true
              }
            }],
            yAxes: [{
              display: true
            }]
          },
          plugins: {
              filler: {
                  propagate: true
              }
          }
        })
      },
      load() {
        this.$raptor.Inventory().read(this.device)
        .then((device) => {
          // console.log(device)
          this.stream = device.getStream(this.stream)
          this.subscribeStream(this.stream);
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
        var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, ts)
        .then((streams) => {
          // console.log(streams)
          context.selectedStreamData = streams
          this.dataForChart = [];
          this.streamChartLabels = []
          let obj = context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
          this.dataForChart = obj.data
          this.streamChartLabels = obj.labels
          context.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
          this.loading = false
        })
        .then(() => {
          this.$raptor.Stream().subscribe(stream, function(msg) {
            console.log(msg)
            context.selectedStreamData.push(msg.record);
            this.dataForChart = [];
            this.streamChartLabels = []
            let obj = context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
            this.dataForChart = obj.data
            this.streamChartLabels = obj.labels
            context.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
            // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
            //   return
            // }
          });
          context.unsubscribeStream({name: this.stream, deviceId: this.device})
        })
      },
      unsubscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      },
      extractChartDataDeviceStreamOneChannel (d, channel, pushData) {
        let dataForChart = [];
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
          data: dataForChart
        }]
        this.renderLineChart(dataset, labels);
      },
      // multiple sources
      loadDatasets() {
        for (var i = 0; i < this.chartData.length; i++) {
          this.$raptor.Inventory().read(this.chartData[i].device)
          .then((device) => {
            // console.log(device)
            for (var j = 0; j < this.chartData.length; j++) {
              // console.log(this.chartData[j])
              let str = device.getStream(this.chartData[j].stream)
              if(this.chartData[j].device == device.id) {
                let dev = {
                  device: device,
                  stream: str,
                  channel: this.chartData[j].channel
                }
                if(!this.checkDatasetExist(dev)) {
                  this.datasets.push(dev)
                  this.subscribeDatasetStreams(this.datasets[j].stream);
                }
              }
            }
            // this.getStream("obd");
            console.log(this.datasets)
          })
          .catch((e) => {
            this.$log.debug('Failed to load device')
            this.$log.error(e)
            this.loading = false
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
        var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, ts)
        .then((streams) => {
          console.log(streams)
          if(streams.length > 0) {
            for (var j = 0; j < this.datasets.length; j++) {
              // console.log(streams[0].json.deviceId + " " + this.datasets[j].device.id)
              if(this.datasets[j].device.id == streams[0].json.deviceId) {
                this.datasets[j].selectedStreamData = streams
                let obj = this.extractChartDataDeviceStreamOneChannel(streams,this.datasets[j].channel);
                // console.log(obj)
                this.datasets[j].dataForChart = obj.data
                this.datasets[j].streamChartLabels = obj.labels
                this.streamChartLabels = this.streamChartLabels.concat(obj.labels)
              }
            }
          }
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
          this.loading = false
        })
        .then(() => {
          let dsets = []
          console.log(this.datasets)
          for (var i = 0; i < this.datasets.length; i++) {
            dsets.push({
              label: this.datasets[i].channel,
              // fill: false,
              // borderColor: colors[i],
              backgroundColor: colors[i],
              data: this.datasets[i].dataForChart
            })
          }
          this.chartDatasets = dsets
          let lbls = this.streamChartLabels
          this.streamChartLabels = lbls.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
          })
          this.renderLineChart(this.chartDatasets, this.streamChartLabels);
        })
        .then(()=> {
          //subscription
          var context = this;
          this.$raptor.Stream().subscribe(stream, function(msg) {
            console.log(msg)
            for (var j = 0; j < context.datasets.length; j++) {
              // console.log(msg.device + " " + context.datasets[j].device)
              console.log(context.datasets[j])
              if(context.datasets[j].device.id == msg.device.id) {
                context.datasets[j].selectedStreamData.push(msg.record)
                let obj = context.extractChartDataDeviceStreamOneChannel(context.datasets[j].selectedStreamData,context.datasets[j].channel);
                context.datasets[j].dataForChart = [];
                context.datasets[j].streamChartLabels = []
                context.datasets[j].dataForChart = obj.data
                context.datasets[j].streamChartLabels = obj.labels
                context.streamChartLabels = context.streamChartLabels.concat(obj.labels)
                context._chart.data.datasets[j] = {
                  label: context.datasets[j].channel,
                  backgroundColor: colors[j],
                  data: context.datasets[j].dataForChart
                }
                console.log("data changed")
                // this.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
              }
              // context.unsubscribeStream(context.datasets[j].stream)
            }
            // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
            //   return
            // }
          });
        })
      }
    },
})
</script>
