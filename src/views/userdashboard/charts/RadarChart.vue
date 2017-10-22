<script>
import { Radar } from 'vue-chartjs'

export default Radar.extend({
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
      this.renderRadarChart();
    //   this.renderChart({
    //   labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
    //   datasets: [
    //     {
    //       label: 'My First dataset',
    //       backgroundColor: 'rgba(179,181,198,0.2)',
    //       borderColor: 'rgba(179,181,198,1)',
    //       pointBackgroundColor: 'rgba(179,181,198,1)',
    //       pointBorderColor: '#fff',
    //       pointHoverBackgroundColor: '#fff',
    //       pointHoverBorderColor: 'rgba(179,181,198,1)',
    //       data: [65, 59, 90, 81, 56, 55, 40]
    //     },
    //     {
    //       label: 'My Second dataset',
    //       backgroundColor: 'rgba(255,99,132,0.2)',
    //       borderColor: 'rgba(255,99,132,1)',
    //       pointBackgroundColor: 'rgba(255,99,132,1)',
    //       pointBorderColor: '#fff',
    //       pointHoverBackgroundColor: '#fff',
    //       pointHoverBorderColor: 'rgba(255,99,132,1)',
    //       data: [28, 48, 40, 19, 96, 27, 100]
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
            bbackgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: arr
          }]
        }, {
          responsive: false,
          maintainAspectRatio: true
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
