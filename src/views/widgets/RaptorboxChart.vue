<template>

  <div>
    <div class="chart-wrapper">
      <line-chart :chartData="chart" :height="height" :searchData="searchData"/>
    </div>
    <div class="text-right">
      <b-button href="https://v5.raptorbox.eu" variant="outline-success" target="_blank">RaptorBox</b-button>
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
  created () {
    const cfg = this.$raptor.getConfig()
    this.username = cfg.username
    this.password = cfg.password
  },
  mounted () {
    this.login()
    // console.log(this.height + ' ' + this.chartdata + ' ' + this.width + ' ' + this.token)
    // console.log('******************************************')
    // console.log(JSON.parse(this.chartdata))
  },
  methods: {
    login () {
      let cfg = {
        token: this.token
      }
      this.$raptor.Auth().login(cfg)
        .then((user) => {
          console.log('Welcome %s', this.$raptor.Auth().getUser().username)
          this.load()
          this.chart = JSON.parse(this.chartdata)
          this.searchData = "updateChart"
        })
        .catch((e) => {
          console.log(`Error: ${e.message}`)
        })
    },
    load() {
      localStorage.raptor = JSON.stringify({
        token: this.$raptor.Auth().getToken()
      })
    }
  }
}
</script>