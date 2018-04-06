<script>
import { Line } from 'vue-chartjs'
import zoom from 'chartjs-plugin-zoom';
import methods from './helper.js'
import moment from 'moment'

var currentDate = moment();

var colors = [
              'rgb(65,184,131)',
              'rgb(228,102,81)',
              'rgb(0,216,255)',
              'rgb(221,27,22)',
              'rgb(225,225,0)'
            ]

export default Line.extend({
    props: ['height', 'chartData', 'width', 'searchData', 'dataPassed', 'spinnerLoading'],
    mixins: [methods],
    data() {
      return {
        chartsData: {
          dictUser: {},
          streamChartLabels: [],
          dataChartDevice: null,
          labels: [],
          device: null,
          channel: null,
          stream: null,
          dataForChart: [10, 39, 10, 40, 39, 0, 0],
          selectedStreamData: [],
          datasets: [],
          chartDatasets: [],
          // for slider
          fromDate: null,
          toDate: null,
          // records devices
          devices: [],
          // realtime updates
          realtimeUpdate: true,
          // new
          apiCalls: 0,
          chartUpdate: false,
        }
      }
    },
    mounted () {
      this.addPlugin(zoom);
      this.chartsData._chart = this._chart
      // console.log(this.chartData)
      if( !(this.chartData instanceof Array) ) {
        this.chartsData.device = this.chartData.device
        this.chartsData.channel = this.chartData.channel
        this.chartsData.stream = this.chartData.stream
        this.load(this.chartsData)
      } else {
        this.chartsData.chartData = this.chartData
        this.loadDatasets(this.chartsData)
      }
      this.renderLineChart();
    },
    created() {
      document.addEventListener('beforeunload', this.handler())
    },
    watch: {
      searchData: function(data) {
        if(data === 'updateChart') {
          console.log(this.chartData)
          this.chartsData.chartData = this.chartData
          this.loadDatasets(this.chartsData)
          this.renderLineChart();
        } else {
          // console.log(data)
          this.chartsData.streamChartLabels = []
          this.chartsData.realtimeUpdate = this.dataPassed.realtime
          this.chartsData.fromDate = this.dataPassed.fromDate
          this.chartsData.toDate = this.dataPassed.toDate
          // console.log(this.fromDate + "    " + this.toDate)
          // console.log("this.realtimeUpdate " + this.realtimeUpdate)
          if(!this.chartsData.realtimeUpdate) {
            this.searchDataForDates(this.chartsData, this.chartsData.fromDate, this.chartsData.toDate)
          } else {
            this.chartsData.selectedStreamData = []
            this.chartsData.dataForChart = []
            this.chartsData.datasets = []
            this.loadDatasets(this.chartsData)
          }
        }
      }
    },
    methods: {
      handler () {
        if(this.chartsData.datasets && this.chartsData.datasets.length > 0) {
          for (var j = 0; j < this.chartsData.datasets.length; j++) {
            if(this.chartsData.datasets[j].stream) {
              this.unsubscribeStream(this.chartsData.datasets[j].stream)
            }
          }
        } else {
          this.unsubscribeStream ({name: this.chartsData.stream, deviceId: this.chartsData.device});
        }
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
          spanGaps: true,
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
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'index',
            intersect: false,
          },
          // Container for pan options
          // pan: {
          //     enabled: true,
          //     mode: 'x',
          // },
          // // Container for zoom options
          // zoom: {
          //     enabled: true,
          //     mode: 'x',
          // }
        })
      },
      load(chartsData) {
        this.$raptor.Inventory().read(chartsData.device)
        .then((device) => {
          // console.log(device)
          chartsData.stream = device.getStream(chartsData.stream)
          this.subscribeStream(chartsData, chartsData.stream);
          this.$emit('devicedata', device);
          // this.getStream("obd");
        })
        .catch((e) => {
          this.gotError(e)
        })
      },
      // subscription / unsunscription of the data for the selected charts
      subscribeStream (chartsData, stream) {
        let context = this
        this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        .then((streams) => {
          // console.log(streams)
          streams = this.sortDates(streams);
          chartsData.selectedStreamData = streams
          this.processSingleData(chartsData)
        })
        .catch((e) => {
          this.gotError(e)
        })
        .then(() => {
          if(chartsData.realtimeUpdate) {
            this.$raptor.Stream().subscribe(stream, function(msg) {
              // console.log(msg.record)
                if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {
                  let last = chartsData.selectedStreamData[chartsData.selectedStreamData.length-1]
                  if(last.timestamp != msg.record.timestamp && last.deviceId == msg.record.deviceId) {
                    context.limitArrayAndPush(chartsData.selectedStreamData, 100, msg.record)
                    chartsData.dataForChart = [];
                    chartsData.streamChartLabels = []
                    let obj = context.extractChartDataDeviceStream(chartsData.selectedStreamData,chartsData.channel);
                    chartsData.dataForChart = obj.data
                    chartsData.streamChartLabels = obj.labels
                    context._chart.data.datasets[0].data = chartsData.dataForChart
                    context._chart.data.labels = chartsData.streamChartLabels
                    context._chart.update({easing: 'easeOutBounce'})
                  }
                }
            });
          }
        })
      },
      processSingleData (chartsData) {
        chartsData.dataForChart = [];
        chartsData.streamChartLabels = []
        let obj = this.extractChartDataDeviceStream(chartsData.selectedStreamData,chartsData.channel);
        chartsData.dataForChart = obj.data
        chartsData.streamChartLabels = obj.labels
        this.populateChart(chartsData, chartsData.streamChartLabels, chartsData.channel, chartsData.dataForChart)
        this.$emit('isLoadingDone', false);
      },
      unsubscribeStream (stream) {
        this.$raptor.Stream().unsubscribe(stream, function(msg) {
          console.log(msg)
        });
      },
      extractChartDataDeviceStream (d, channel) {
        let dataForChart = [];
        let valueAdded = false;
        let valueToCompare = ''
        let timeDifference = 0;
        let selectedDisplayParam = '';
        if(d.length <= 500) {
          selectedDisplayParam = null;
        } else if(d.length > 500  && d.length <= 1000) {
          selectedDisplayParam = '1'
          timeDifference = 1000*60;
        } else if(d.length > 1000 && d.length <= 5000) {
          selectedDisplayParam = '5'
          timeDifference = 1000*60*5;
        } else if(d.length > 5000 && d.length <= 10000) {
          selectedDisplayParam = '10'
          timeDifference = 1000*60*10;
        } else if(d.length > 10000 && d.length <= 25000) {
          selectedDisplayParam = '30'
          timeDifference = 1000*60*30;
        } else if(d.length > 25000 && d.length <= 50000) {
          selectedDisplayParam = '60'
          timeDifference = 1000*60*60*1;
        } else if(d.length > 50000  && d.length <= 100000) {
          selectedDisplayParam = '180'
          timeDifference = 1000*60*60*3;
        } else {
          selectedDisplayParam = 'unlimited'
          timeDifference = 1000*60*60*12;
        }
        if(selectedDisplayParam != null) {
          this.handler()
        }
        // console.log(d.length + ' total values and display param ' + selectedDisplayParam + ' timeDifference: ' + timeDifference)
        let streamChartLabels = []
        for (var i = 0; i < d.length; i++) {
          let s = d[i];
          let date = new Date(s.timestamp * 1000)
          if(i == 0) {
            valueToCompare = date;
          }
          if(timeDifference > 0) {
            if(Math.abs(valueToCompare - date) < timeDifference) {
              valueAdded = true
            } else {
              valueToCompare = date;
              valueAdded = false;
            }
          }
          if(!valueAdded) {
            let sDate = date.toString(); //.toLocaleString();
            if((typeof s.channels[channel]) === 'number' || (typeof s.channels[channel]) === 'boolean' || (!isNaN(s.channels[channel] * 1))) {
              streamChartLabels.push(sDate)
              dataForChart.push(s.channels[channel])
            }
          }
        }

        return { labels: streamChartLabels, data: dataForChart }
      },
      populateChart(chartsData, labels, lbl, dataForChart) {
        let dataset = [{
          label: chartsData.device.name + ' - ' + lbl,
          fill: false,
          borderColor: colors[0],
          backgroundColor: colors[0],
          fillColor: colors[0],
          data: dataForChart
        }]
        // console.log(this._chart)
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          this._chart.destroy();
          this.renderLineChart(dataset, labels);
        }
      },
      // multiple sources
      loadDatasets(chartsData) {
        let devices = []
        for (var i = 0; i < chartsData.chartData.length; i++) {
          this.$raptor.Inventory().read(chartsData.chartData[i].device)
          .then((device) => {
            // console.log(device)
            for (var j = 0; j < chartsData.chartData.length; j++) {
              if(chartsData.chartData[j].device.id == device.id || chartsData.chartData[j].device == device.id) {
                let str = device.getStream(chartsData.chartData[j].stream)
                let dev = {
                  device: device,
                  stream: str,
                  channel: chartsData.chartData[j].channel,
                  pushed: false,
                  dataForChart: [],
                  streamChartLabels: []
                }
                let exist = this.checkDatasetExist(chartsData, dev)
                if(!exist) {
                  chartsData.datasets.push(dev)
                  devices.push(device)
                  if(dev.stream) {
                    this.getDataForStream(chartsData, dev.stream);
                  }
                  if(devices.length == chartsData.chartData.length) {
                    this.$emit('devicedata', devices);
                    this.initializeChart(chartsData, chartsData.datasets, chartsData.streamChartLabels)
                    devices = []
                  }
                }
              }
            }
          })
          .catch((e) => {
            this.gotError(e)
          })
        }
      },
      checkDatasetExist(chartsData, dev) {
        let exist = false
        // console.log(dev)
        for (var k = 0; k < chartsData.datasets.length; k++) {
          if(chartsData.datasets[k].device.id == dev.device.id && chartsData.datasets[k].stream.name == dev.stream.name && dev.channel == chartsData.datasets[k].channel) {
            exist = true
          }
        }
        return exist
      },
      initializeChart(chartsData, data, labels) {
        let dsets = []
        for (var i = 0; i < data.length; i++) {
          dsets.push({
            label: data[i].device.name + ' - ' + data[i].channel,
            fill: false,
            backgroundColor: colors[i],
            fillColor: colors[i],
            borderColor: colors[i],
            data: []
          })
        }
        chartsData.chartDatasets = dsets
        chartsData.streamChartLabels = labels.filter(function(elem, index, self) {
          return index == self.indexOf(elem);
        })
        if((this._chart || this._chart != undefined || this._chart != null) && this._chart.ctx != null) {
          this._chart.destroy()
          this.renderLineChart(chartsData.chartDatasets, chartsData.streamChartLabels);
        }
      },
      getDataForStream (chartsData, stream) {
        // console.log(stream)
        let d = new Date();
        let requiredDate = new Date(d.getTime() - (1000*60*60)*3);
        let query = {timestamp: {between:[requiredDate.getTime(), (new Date()).getTime()]}, page:0, size:100,sort:"timestamp,DESC"}
        // this.$raptor.Stream().list(stream, 0, 100, 'timestamp,desc')
        this.$raptor.Stream().search(stream, query)
        .then((streams) => {
          // console.log(streams)
          if(streams.length > 0) {
            this.processMultipleData(chartsData, streams, false)
            if(chartsData.realtimeUpdate) {
              this.subscribeDatasetStreams(chartsData, stream)
            }
          }
        })
        .catch((e) => {
          this.gotError(e)
        })
      },
      processMultipleData (chartsData, streams, concat) {
        for (var j = 0; j < chartsData.datasets.length; j++) {
          let deviceId = null;
          if(streams && streams[0].stream && streams[0].stream.json.deviceId) {
            deviceId = streams[0].stream.json.deviceId
          } else {
            deviceId = streams[0].json.deviceId
          }
          if(chartsData.datasets[j].device.id == deviceId) {
            let dataset = chartsData.datasets[j]
            if(concat) {
              dataset.selectedStreamData.concat(streams)
              if(dataset.selectedStreamData == null) {
                streams = this.sortDates(streams);
              }
            } else {
              if(dataset.selectedStreamData == null) {
                streams = this.sortDates(streams);
              }
              if(streams.length > 200) {
                for (var i = 0; i < streams.length; i++) {
                  chartsData.datasets[j].selectedStreamData = streams[i];
                }
              } else {
                chartsData.datasets[j].selectedStreamData = streams
              }
            }
            let obj = this.extractChartDataDeviceStream(streams,dataset.channel);
            chartsData.datasets[j].dataForChart = obj.data
            chartsData.datasets[j].streamChartLabels = obj.labels
            chartsData.streamChartLabels = this.sortAndRemoveDuplicats(chartsData.streamChartLabels, obj.labels)
            if(!chartsData.datasets[j].pushed) {
              chartsData.datasets[j].pushed = true
              chartsData.datasets = this.fillData(chartsData.streamChartLabels, chartsData.datasets)
              this._chart.data.labels = chartsData.streamChartLabels
              if(this._chart.data.datasets[j]) {
                this._chart.data.datasets[j].data = chartsData.datasets[j].dataForChart
              }
              this._chart.update({easing: 'easeOutBounce'})
              this.$emit('isLoadingDone', false);
            }
          }
        }
      },
      //subscription
      subscribeDatasetStreams(chartsData, stream) {
        let context = this;
        this.$raptor.Stream().subscribe(stream, function(msg) {
          // console.log(msg)
            if((context._chart || context._chart != undefined || context._chart != null) && context._chart.ctx != null) {

              for (var j = 0; j < chartsData.datasets.length; j++) {
                let dset = chartsData.datasets[j];
                if(dset.device.id == msg.device.id && dset.selectedStreamData) {
                  let last = dset.selectedStreamData[dset.selectedStreamData.length-1]
                  // check timestamp of last record on this device data
                  if(last.timestamp != msg.record.timestamp) {
                    // get data and label from received msg
                    let recordData = msg.record.channels[dset.channel]
                    let date = new Date(msg.record.timestamp * 1000)
                    // console.log(date.toString())

                    // check whether labels of this devices have the new label
                    if(dset.streamChartLabels[dset.streamChartLabels.length-1] == date.toString()) {
                      // if yes then change the last record
                      dset.dataForChart[dset.dataForChart.length-1] = recordData
                      context._chart.data.datasets[j].data[context._chart.data.datasets[j].data.length-1] = recordData
                    } else {
                      // if no then
                      // push label and check it should not exceed 200 threshold
                      context.limitArrayAndPush(dset.streamChartLabels, 200, date.toString())

                      // push data and check it should not exceed 200 threshold
                      context.limitArrayAndPush(dset.dataForChart, 200, recordData)

                      // push null in data and new label in other devices
                      for (var i = 0; i < chartsData.datasets.length; i++) {
                        if(i!=j) {
                          chartsData.datasets[i].dataForChart.push(null)
                          chartsData.datasets[i].streamChartLabels.push(date.toString())
                        }
                      }

                      context._chart.data.datasets[j].data = dset.dataForChart
                    }
                    // push data in the streams of this device
                    context.limitArrayAndPush(dset.selectedStreamData, 200, msg.record)
                    let val1 = chartsData.streamChartLabels[chartsData.streamChartLabels.length-1]
                    if(val1 != date.toString()) {
                      // push label in general labels
                      context.limitArrayAndPush(chartsData.streamChartLabels, 200, date.toString())
                      context._chart.data.labels = chartsData.streamChartLabels
                    }
                    context._chart.update({easing: 'easeOutBounce'})
                  }
                }
              }
            }
        });
      },

      // search data based on timestamp for device
      searchDataForDates (chartsData, startDate, endDate) {
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
        // unsub data
        this.handler()
        chartsData.chartUpdate = false;
        // "timestamp":{"between":[1510152092358,1510152094358]}
        let pageNumber = 0;
        chartsData.apiCalls = 0;
        chartsData.selectedStreamData = []
        let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,ASC"}
        if( chartsData.datasets.length > 0 ) {
          for (var i = 0; i < chartsData.datasets.length; i++) {
            chartsData.datasets[i].selectedStreamData = []
            chartsData.datasets[i].pushed = false
            this.loopOverStreamPagination (chartsData, chartsData.datasets[i].stream, query, pageNumber, startDate, endDate)
          }
        } else {
          this.loopOverStreamPagination (chartsData, chartsData.stream, query, pageNumber, startDate, endDate)
        }
      },
      searchDataApi(chartsData, stream, query, callback) {
        // console.log(query)
        // console.log(stream)
        let context = this;
        this.$raptor.Stream().search(stream, query)
        .then((stream) => {
          chartsData.apiCalls--;
          console.log(stream.length)
          callback(stream)
        })
        .catch((e) => {
          chartsData.apiCalls--;
          this.gotError(e)
        })
        .then(() => {
          // console.log(chartsData.apiCalls + ' chartsData.apiCalls');
            if(chartsData.apiCalls == 0) {
                if( chartsData.datasets.length > 0) {
                  for (var i = 0; i < chartsData.datasets.length; i++) {
                    // console.log(chartsData.datasets[i].selectedStreamData.length + ' chartsData.datasets[i].selectedStreamData.length')
                    if(chartsData.datasets[i].selectedStreamData && chartsData.datasets[i].selectedStreamData.length > 0) {
                      context.processMultipleData(chartsData, chartsData.datasets[i].selectedStreamData, true)
                    } else {
                      context.$emit('isLoadingDone', false);
                    }
                  }
                } else {
                  context.processSingleData(chartsData)
                }
            }
        })
      },
      loopOverStreamPagination (chartsData, stream, query, pageNumber, startDate, endDate) {
        chartsData.apiCalls++;
        let context = this;
        this.searchDataApi(chartsData, stream, query, function (streams) {
          let total = streams.length
          if(streams && (streams[total-1].timestamp * 1000) < endDate && total == 500) {
            pageNumber = pageNumber + 1
            let query = {timestamp: {between:[startDate, endDate]}, page:pageNumber, size:500,sort:"createdAt,ASC"}
            if( chartsData.datasets.length > 0) {
              for (var i = 0; i < chartsData.datasets.length; i++) {
                let deviceId = null;
                if(streams && streams[0].stream && streams[0].stream.json.deviceId) {
                  deviceId = streams[0].stream.json.deviceId
                } else {
                  deviceId = streams[0].json.deviceId
                }
                if(chartsData.datasets[i].device.id == deviceId) {
                  chartsData.datasets[i].selectedStreamData = chartsData.datasets[i].selectedStreamData.concat(streams)
                  context.loopOverStreamPagination(chartsData, chartsData.datasets[i].stream, query, pageNumber, startDate, endDate)
                }
              }
            } else {
              chartsData.selectedStreamData = chartsData.selectedStreamData.concat(streams)
              context.loopOverStreamPagination(chartsData, stream, query, pageNumber, startDate, endDate)
            }
          } else {
              if( chartsData.datasets.length > 0) {
                for (var i = 0; i < chartsData.datasets.length; i++) {
                  let deviceId = null;
                  if(streams && streams[0].stream && streams[0].stream.json.deviceId) {
                    deviceId = streams[0].stream.json.deviceId
                  } else {
                    deviceId = streams[0].json.deviceId
                  }
                  if(chartsData.datasets[i].device.id == deviceId) {
                    chartsData.datasets[i].selectedStreamData = chartsData.datasets[i].selectedStreamData.concat(streams)
                  }
                }
              } else {
                chartsData.selectedStreamData = chartsData.selectedStreamData.concat(streams)
              }
          }
        })
      },
      // limit the array and push data
      limitArrayAndPush(array, limit, data) {
        if(array.length > limit) {
          array.shift()
        }
        array.push(data)
      },
      // sort dates
      sortDates (array) {
        array.sort(function(a,b) {
          let aDate = new Date(a);
          let bDate = new Date(b);
          return aDate.getTime() - bDate.getTime();
        })
        return array
      },
      sortAndRemoveDuplicats (streamChartLabels, labels) {
        streamChartLabels = streamChartLabels.concat(labels)
        streamChartLabels = this.sortDates(streamChartLabels)
        streamChartLabels = streamChartLabels.filter(function(elem, index, self) {
          return index === self.indexOf(elem);
        })
        return streamChartLabels;
      },
      fillData (streamChartLabels, datasets) {
        // console.log(this.streamChartLabels)
        for (var i = 0; i < streamChartLabels.length; i++) {
          for (var j = 0; j < datasets.length; j++) {
            if(datasets[j].streamChartLabels.indexOf(streamChartLabels[i]) === -1)  {
              datasets[j].streamChartLabels.splice(i, 0, streamChartLabels[i])
              datasets[j].dataForChart.splice(i, 0, undefined);
            }
          }
        }
        // console.log(this.datasets)
        return datasets
      },
      gotError (e) {
        if(this.$log) {
          this.$log.debug('Failed to load streams')
          if (e.toString().indexOf('Unauthorized') !== -1) {
            this.$raptor.Auth().logout()
            if(this.$router) {
              this.$router.push('/pages/login')
            }
          }
        }
      }
    },
})
</script>
