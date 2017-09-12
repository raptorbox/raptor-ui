<script>
  import { Bar } from 'vue-chartjs'

  export default Bar.extend({
    props: ['height', 'data', 'labels'],
    mounted () {
      this.renderLineChart();
    },
    computed: {
      chartData: function() {
        return this.data
      }
    },
    methods: {
      renderLineChart () {
        this.renderChart(
        {
          labels: this.labels,
          datasets: [
          {
            label: 'Devices',
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
              display: false,
              categoryPercentage: 1,
              barPercentage: 0.5
            }],
            yAxes: [{
              display: false
            }]
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
