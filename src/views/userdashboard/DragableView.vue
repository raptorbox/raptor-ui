<script>
  import { Line } from 'vue-chartjs'

  export default Line.extend({
    props: ['height', 'data', 'labels'],
    mounted () {
      // this.fetchData()
      this.renderLineChart();
    },
    computed: {
      chartData: function() {
        return this.data
      }
    },
    methods: {
      renderLineChart () {
        // console.log("chart data and labels: " + this.data + "=======" + this.labels)
        this.renderChart(
        {
          labels: this.labels,
          datasets: [
          {
            label: 'Users',
            bbackgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: this.chartData
          }]
        }, {
          maintainAspectRatio: false,
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
      }
    },
    watch: {
      data: function() {
        this._chart.destroy();
      this.renderLineChart();
    }
  }
})
</script>
