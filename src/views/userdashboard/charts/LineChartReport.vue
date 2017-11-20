<script>
import { Line } from 'vue-chartjs'
import moment from 'moment'

var currentDate = moment();

var colors = [
              '#41B883',
              '#E46651',
              '#00D8FF',
              '#DD1B16'
            ]

export default Line.extend({
  props: ['height', 'width', 'searchData', 'dataPassed'],
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
        // for slider
        selectedDisplayParam: null,
        fromDate: null,
        toDate: null,
        // records devices
        devices: [],
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
              display: true,
              ticks: {
                display: false,
                autoSkip : false,
                callback: function(value, index, values) {
                    return new moment(value).format('DD MMM');
                }
              },
              gridLines : {
                  display : true,
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
        this._chart.destroy();
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
        console.log(query)
        console.log(stream)
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
            context.populateChart(context.streamChartLabels, context.channel, context.dataForChart)
          }
        })
      },
    },
})
</script>
