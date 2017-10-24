<script>
import { Line } from 'vue-chartjs'
import moment from 'moment'

export default Line.extend({
  props: ['height', 'width'],
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
      this.load()
      this.renderLineChart();
    },
    methods: {
      formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY');
      },
      renderLineChart (lbls) {
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
          responsive: true,
          maintainAspectRatio: false,
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
      extractChartDataDev (d) {
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i]
          let sDate = this.formatDate(s.createdAt * 1000).split(' ')[0]
          this.$data.dictUser[sDate] = this.$data.dictUser[sDate] ? this.$data.dictUser[sDate] + 1 : 1;
        }
      },
      load() {
        this.$raptor.Inventory().list()
        .then((list) => {
          // this.$log.debug('Loaded %s device list', list.length);
            console.log(list);
            this.extractChartDataDev(list);
            this.$data.labels = Object.keys(this.$data.dictUser); // getting labels
            this.$data.devices = list;
            this.totalNoOfDevices = list.length;
            list.forEach( (e) => this.listOfDevicesForSelectOptions.push({value: e.id, text: e.name+' - '+e.id}));
            this.changeData();
          })
        .catch(function(e) {
          console.log(e)
          console.log(JSON.stringify(e))
          if(e.toString().indexOf("Unauthorized") !== -1) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
          }
        });
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
          this.loading = false
        })
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
        this.renderLineChart(this.streamChartLabels);
      },
    },
})
</script>
