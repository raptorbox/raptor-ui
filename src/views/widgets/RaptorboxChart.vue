<template>

  <div>
    <div class="chart-wrapper">
      <line-chart :chartData="chart" :height="height" :searchData="searchData"/>
    </div>
  </div>

</template>

<script>
import LineChart from './../userdashboard/charts/LineChart'

export default {
  props: {
    height: { type: String, default: '200px' },
    chartdata: { type: String, default: null },
    width: { type: String, default: '200px' },
    token: { type: String, default: null}
  },
  components: {
    LineChart
  },
  data() {
    return {
      chart: null,
      searchData: ''
    }
  },
  mounted () {
    this.login()
  },
  methods: {
    login () {
      let cfg = {
        token: this.token
      }
      this.$raptor.Auth().login(cfg)
        .then((user) => {
          console.log('Welcome %s', this.$raptor.Auth().getUser().username)
          localStorage.raptor = JSON.stringify({
            token: this.$raptor.Auth().getToken()
          })
          this.chart = JSON.parse(this.chartdata)
          this.searchData = "updateChart"
        })
        .catch((e) => {
          console.log(`Error: ${e.message}`)
        })
    }
  }
}
</script>