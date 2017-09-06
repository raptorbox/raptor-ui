<script>
  import { Line } from 'vue-chartjs'

const brand = ['#20a8d8', '#4dbd74', '#63c2de', '#f86c6b']

function convertHex (hex, opacity) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')'
  return result
}

const brandSuccess = '#4dbd74'
const brandInfo = '#63c2de'
const brandDanger = '#f86c6b'
function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default Line.extend({
  props: ['height','labels', 'data'],
  computed: {
    chartData: function() {
      return this.data
    }
  },
  mounted () {
    this.renderLineChart();
  },
  watch: {
    data: function() {
      this._chart.destroy();
      this.renderLineChart();
    }
  },
  methods: {
    renderLineChart () {
      let datasetsForCharts = Array();
      console.log("======================================================");
      console.log(JSON.stringify(this.chartData));
      console.log(this.chartData);
      console.log("======================================================")
      for (var i = 0; i < this.chartData.length; i++) {
        let ds = this.chartData[i];
        console.log(ds);
        let data = [];
        for (var l = 0; l < ds.length; l++) {
          let finalObject = ds[l];
          let keys = Object.keys(finalObject);
          // console.log(keys);
          for (var j = 0; j < keys.length; j++) {
            let k = keys[j];
            console.log(k + " : " + finalObject[k]);
            let dataToPush = null;
            if(finalObject[k] == "stages") {
              dataToPush = 50;
            } else if (finalObject[k] == -1) {
              dataToPush = 0;
            } else {
              dataToPush = 0;
            }
            console.log(k + " = SleepQuality ");
            if(k != "SleepQuality") {
              dataToPush = parseInt(finalObject[k]);
            }
            let found = false;
            for (let a = 0; a < datasetsForCharts.length; a++) {
              if (datasetsForCharts[a].label == this.labels[j]) {
                datasetsForCharts[a].data.push(dataToPush);
                found = true;
              }
            }
            if(!found) {
              let obj = {
                label: this.labels[j],
                backgroundColor: convertHex(brand[j], 10),
                borderColor: brand[j],
                pointHoverBackgroundColor: '#fff',
                borderWidth: 2,
                data: [dataToPush]
              };
              datasetsForCharts.push(obj);
            }
          }
        }
      }
      if(datasetsForCharts.length == 0) {
        var elements = 27
        var data1 = []
        var data2 = []
        var data3 = []

        for (var i = 0; i <= elements; i++) {
          data1.push(random(50, 200))
          data2.push(random(80, 100))
          data3.push(65)
        }
        datasetsForCharts = [
        {
          label: 'My First dataset',
          backgroundColor: convertHex(brandInfo, 10),
          borderColor: brandInfo,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: data1
        },
        {
          label: 'My Second dataset',
          backgroundColor: 'transparent',
          borderColor: brandSuccess,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: data2
        },
        {
          label: 'My Third dataset',
          backgroundColor: 'transparent',
          borderColor: brandDanger,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 1,
          borderDash: [8, 5],
          data: data3
        }
        ];
      }
      console.log("======================================================");
      console.log(JSON.stringify(datasetsForCharts));
      console.log("======================================================");
      this.renderChart({
        labels: this.labels,
        datasets: datasetsForCharts
      }, {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil(250 / 5),
              max: 250
            },
            gridLines: {
              display: true
            }
          }]
        },
        elements: {
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3
          }
        }
      })
    }
  }
})
</script>
