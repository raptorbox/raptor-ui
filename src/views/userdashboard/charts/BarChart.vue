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
        deviceDataTime: null,
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
    methods: {
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
              barPercentage: 1
            }],
            yAxes: [{
              display: true
            }]
          },
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
          // context.selectedStreamData = streams
          // context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
          context.selectedStreamData = streams
          this.dataForChart = [];
          this.streamChartLabels = []
          let obj = context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
          this.dataForChart = obj.data
          this.streamChartLabels = obj.labels
          this.populateChart(this.streamChartLabels, this.channel, this.dataForChart)
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
        })
        // this.$raptor.Stream().subscribe(stream, function(msg) {
        //   console.log(msg)
        //   context.selectedStreamData.push(msg.record);
        //   let obj = context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
        //   context.dataForChart = obj.data
        //   context.streamChartLabels = obj.labels
        //   context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
        //   // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
        //   //   return
        //   // }
        // });
        // context.unsubscribeStream(stream)
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
          borderColor: '#f87979',
          borderWidth: 2,
          data: dataForChart
        }]
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
        var ts = Math.round((new Date()).getTime() / 1000);
        this.$raptor.Stream().list(stream, 0, ts)
        .then((streams) => {
          console.log(streams)
          if(streams.length > 0) {
            for (var j = 0; j < this.datasets.length; j++) {
              console.log(streams[0].json.deviceId + " " + this.datasets[j].device.id)
              if(this.datasets[j].device.id == streams[0].json.deviceId) {
                this.datasets[j].selectedStreamData = streams
                let obj = this.extractChartDataDeviceStreamOneChannel(streams,this.datasets[j].channel);
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
          this.renderBarChart(this.chartDatasets, this.streamChartLabels);
        })
      }
    },
})
</script>
