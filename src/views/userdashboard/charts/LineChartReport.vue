<script>
import { Line } from 'vue-chartjs'
import moment from 'moment'

var colors = [
              '#41B883',
              '#E46651',
              '#00D8FF',
              '#DD1B16'
            ]

export default Line.extend({
  props: ['height', 'width'],
    data() {
      return {
        dictUser: {},
        streamChartLabels: [],
        chartDatasets: [],
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
      }
    },
    mounted () {
      this.load()
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
      renderLineChart () {
        this.renderChart(
        {
          labels: this.streamChartLabels,
          datasets: this.chartDatasets
        }, {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: false,
              ticks: {
                autoSkip : false,
                callback: function(value, index, values) {
                    return new moment(value).format('DD MMM');
                }
              },
              gridLines : {
                  display : false,
              }
            }],
            yAxes: [{
              display: true
            }]
          },
        })
      },
      populateChart (records) {
        let arr = []
        let lbls = []
        for (var i = 0; i < records.length; i++) {
          let dev = records[i]
          let sDate = this.formatDate(dev.json.createdAt * 1000)
          lbls.push(sDate)
          if(!arr[dev.json.name]) {
            let name = dev.json.name
            arr[name] = []
          } else {
            arr[dev.json.name].push(dev)
          }
        }
        this.streamChartLabels = lbls.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        })
        this.chartDatasets = []
        let keys = Object.keys(arr)
        for (var i = 0; i < keys.length; i++) {
          let dataset = {
            label: keys[i],
            backgroundColor: colors[i],
            data: []
          }
          let countArray = {}
          for (var j = 0; j < arr[keys[i]].length; j++) {
            let dev = arr[keys[i]][j]
            let sDate = this.formatDate(dev.json.createdAt * 1000)
            countArray[sDate] = countArray[sDate] ? countArray[sDate] + 1 : 1;
          }
          dataset.data = Object.values(countArray)
          this.chartDatasets.push(dataset)
        }
        // console.log(this.streamChartLabels)
        this.renderLineChart();
      },
      load() {
        this.$raptor.Inventory().list()
        .then((list) => {
          // this.$log.debug('Loaded %s device list', list.length);
            // console.log(list);
            this.populateChart(list);
            // this.$data.labels = Object.keys(this.$data.dictUser); // getting labels
            // this.$data.devices = list;
            // this.totalNoOfDevices = list.length;
            // this.changeData();
          })
        .catch(function(e) {
          if(e.toString().indexOf("Unauthorized") !== -1) {
            context.$raptor.Auth().logout();
            context.$router.push("/pages/login");
          }
        });
      },
    },
})
</script>
