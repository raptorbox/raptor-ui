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

export default Line.extend({
  props: ['height','labels', 'data', 'chartLabel'],
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
      if(this._chart != null && this._chart.ctx != null) {
        this._chart.data.datasets = [{
            label: this.chartLabel,
            backgroundColor: convertHex(brandInfo, 10),
            borderColor: brandInfo,
            pointHoverBackgroundColor: '#fff',
            borderWidth: 2,
            data: this.data
          }]
        this._chart.data.labels = this.labels
        this._chart.update()
      } else {
        this._chart.destroy();
        this.renderLineChart();
      }
    }
  },
  methods: {
    renderLineChart () {
      let datasetsForCharts = [
        {
          label: this.chartLabel,
          backgroundColor: convertHex(brandInfo, 10),
          borderColor: brandInfo,
          pointHoverBackgroundColor: '#fff',
          borderWidth: 2,
          data: this.data
        }
      ];
      // console.log("======================================================");
      // console.log(JSON.stringify(datasetsForCharts));
      // console.log("======================================================");
      this.renderChart({
          labels: this.labels,
          datasets: datasetsForCharts
        }, {
          animation: {
            duration: 100
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true
          },
          scales: {
            xAxes: [{
              display: false,
              gridLines: {
                display: true
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 5,
                // stepSize: Math.ceil(Math.max(this.data.length) / 10),
                // max: Math.max(this.data.length) + 10
              },
              gridLines: {
                display: true
              }
            }]
          },
          plugins: {
              filler: {
                  propagate: true
              }
          },
          // elements: {
          //   point: {
          //     radius: 0,
          //     hitRadius: 10,
          //     hoverRadius: 4,
          //     hoverBorderWidth: 3
          //   }
          // }
      })
    }
  }
})
</script>
