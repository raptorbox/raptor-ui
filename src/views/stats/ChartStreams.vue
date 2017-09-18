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
      let max = 0 //Number.MAX_VALUE
      let datasetsForCharts = Array();
      for (var i = 0; i < this.chartData.length; i++) {
        let ds = this.chartData[i];
        // console.log(ds);
        let data = [];
        for (var l = 0; l < ds.length; l++) {
          let finalObject = ds[l];
          // console.log(finalObject);
            let found = false;
            let dataToPush = parseInt(finalObject);
            for (let a = 0; a < datasetsForCharts.length; a++) {
              if (datasetsForCharts[a].label == this.labels[0]) {
                datasetsForCharts[a].data.push(dataToPush);
                found = true;
                if(dataToPush > max) {
                  max = dataToPush
                }
              }
            }
            if(!found) {
              let obj = {
                label: this.labels[0],
                backgroundColor: convertHex(brand[0], 10),
                borderColor: brand[0],
                pointHoverBackgroundColor: '#fff',
                borderWidth: 2,
                data: [dataToPush]
              };
              datasetsForCharts.push(obj);
            }
          // }
        }
      }
      if(datasetsForCharts.length == 0) {
        var elements = 27
        datasetsForCharts = [
        {
          label: 'My First dataset',
          backgroundColor: convertHex(brandInfo, 10),
          borderColor: brandInfo,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: []
        },
        {
          label: 'My Second dataset',
          backgroundColor: 'transparent',
          borderColor: brandSuccess,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: []
        },
        {
          label: 'My Third dataset',
          backgroundColor: 'transparent',
          borderColor: brandDanger,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 1,
          borderDash: [8, 5],
          data: []
        }
        ];
      }
      // console.log("======================================================");
      // console.log(JSON.stringify(datasetsForCharts));
      // console.log("======================================================");
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
              stepSize: Math.ceil((max) / 5),
              max: max + 10
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
