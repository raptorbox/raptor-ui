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
              gridLines: {
                color: 'transparent',
                zeroLineColor: 'transparent'
              },
              ticks: {
                fontSize: 2,
                fontColor: 'transparent'
              }
            }],
            yAxes: [{
              display: false,
              ticks: {
                display: false
              }
            }]
          },
          elements: {
            line: {
              borderWidth: 1
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4
            }
          }
        })
      }
      /*formatDate (d) {
        return moment(new Date(d)).format('MMMM Do YYYY')
      },
      getLabels (d) {
        let months = Array()
        for (var i = 0, len = d.length; i < len; i++) {
          let s = d[i]
          let sDate = this.formatDate(s.created).split(' ')[0]
          if(months.indexOf(sDate) == -1) {
            months.push(sDate)
          }
        }
        console.log(months)
        return months
      },
      fetchData () {
        this.$log.debug('Fetching user list')
        this.$raptor.Admin().User().list()
        .then((list) => {
          this.$log.debug('Loaded %s user list', list.length)
          this.labels = this.getLabels(list)
          this.data = {
            label: 'Users',
            backgroundColor: '#20a8d8',
            borderColor: 'rgba(255,255,255,.55)',
            data: list.length
          }
          console.log(list)
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list')
          this.$log.error(e)
        })
      }*/

    },
    watch: {
      data: function() {
        this._chart.destroy();
        this.renderLineChart();
      }
    }
  })
</script>
