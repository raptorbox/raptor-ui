<script>
import { Bar } from 'vue-chartjs'
import moment from 'moment'

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
      // this.fetchData()
      console.log(this.chartData)
      this.device = this.chartData.device
      this.channel = this.chartData.channel
      this.stream = this.chartData.stream
      // this.subscribeStream({name: this.stream, deviceId: this.device})
      this.load()
      this.renderBarChart();
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY');
      },
      renderBarChart (lbls) {
        this.renderChart(
        {
          labels: lbls,
          datasets: [
          {
            label: this.channel,
            backgroundColor: '#f87979',
            data: this.dataForChart
          }]
        }, {
          responsive: false,
          maintainAspectRatio: true,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: false
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
          context.selectedStreamData = streams
          context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,context.channel);
        })
        .catch((e) => {
          this.$log.debug('Failed to load streams')
          this.$log.error(e)
        })
        // this.$raptor.Stream().subscribe(stream, function(msg) {
        //   console.log(msg)
        //   context.selectedStreamData.push(msg.record);
        //   context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,'minutes',context.channel);
        //   context.changeStreamData();
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
        this.dataForChart = [];
        this.streamChartLabels = []
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          if(i == 0) {
            this.deviceDataTime = this.formatDate(s.timestamp * 1000);
          }
          let sDate = (new Date(s.timestamp * 1000)).toUTCString();
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean') {
            this.streamChartLabels.push(sDate)
            this.dataForChart.push(s.channels[channel])
          }
        }
        this.renderBarChart(this.streamChartLabels);
      },
    },
})
</script>
