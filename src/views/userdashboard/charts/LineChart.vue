<script>
import { Line } from 'vue-chartjs'

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
        deviceDataTime: null,
      }
    },
    mounted () {
      // this.fetchData()
      console.log(this.chartData)
      this.device = this.chartData.device
      this.channel = this.chartData.channel
      this.stream = this.chartData.stream
      this.subscribeStream(this.stream)
      this.renderLineChart();
      // this.renderChart({
      //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      //   datasets: [
      //     {
      //       label: 'Data One',
      //       backgroundColor: '#f87979',
      //       data: [40, 39, 10, 40, 39, 80, 40]
      //     }
      //   ]
      // }, {responsive: true, maintainAspectRatio: false})
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY');
      },
      renderLineChart (arr, lbls) {
        arr = this.dataForChart
        this.renderChart(
        {
          labels: lbls,
          datasets: [
          {
            label: this.channel,
            bbackgroundColor: '#f87979',
            data: arr
          }]
        }, {
          responsive: false,
          maintainAspectRatio: true,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false
            }],
            yAxes: [{
              display: false
            }]
          },
          elements: {
            line: {
              borderWidth: 2
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        })
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().subscribe(stream, function(msg) {
          console.log(msg)
          context.selectedStreamData.push(msg.record);
          context.extractChartDataDeviceStreamOneChannel(context.selectedStreamData,'minutes',context.channel);
          context.changeStreamData();
          // if(!(msg.type === 'stream' && msg.op === 'data' && msg.streamId === this.$raptor.stream)) {
          //   return
          // }
        });
        context.unsubscribeStream(stream)
      },
      unsubscribeStream (stream) {
        var context = this;
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      },
      extractChartDataDeviceStreamOneChannel (d, val, channel, pushData) {
        this.dictDevice = [];
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          if(i == 0) {
            this.deviceDataTime = this.formatDate(s.timestamp * 1000);
          }
          let sDate = this.getDate(s, val)
          if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean') {
            if(!this.dictDevice[sDate]) {
                    this.dictDevice[sDate] = [];
            }
            if(this.dictDevice[sDate]) {
                this.dictDevice[sDate].push(s.channels[channel]);
            }
          }
        }
      },
      getDate(s, val) {
        let sDate = (new Date(s.timestamp * 1000)).getMinutes();
        if(val == 'hours'){
          sDate = (new Date(s.timestamp * 1000)).getHours();
        } else if(val == 'day'){
          sDate = (new Date(s.timestamp * 1000)).getDay();
        } else if(val == 'month'){
          sDate = (new Date(s.timestamp * 1000)).getMonth();
        }
        return sDate;
      },
      changeStreamData: function() {
        let arr = Array();
        this.streamChartLabels = [];
        this.streamChartLabels = Object.keys(this.dictDevice); // getting labels
        for (var i = 0; i < this.streamChartLabels.length; i++) {
          let s = this.streamChartLabels[i];
          arr.push(this.dictDevice[s]);
        }
        // this.dataForChart = arr;
        this.renderLineChart(arr, lbls);
      },
    },
})
</script>
