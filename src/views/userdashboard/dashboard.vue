<template>
  <div class="animated fadeIn">
        <p>
          <button @click="addWidget">
            Add Widget
          </button>
        </p>

        <grid-layout :layout.sync="widgets" :col-num="12" :row-height="30" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true" >
            <grid-item v-for="wid in widgets" :key="wid.i" :minH="6" :minW="3" :maxH="12" :maxW="9" :x.sync="wid.x" :y.sync="wid.y" :w.sync="wid.w" :h.sync="wid.h" :i="wid.i">
                <b-card class="bg-primary">
                  <div class="card-body pb-0">
                    <p>Total Devices</p>
                  </div>
                  <div v-if="wid.chart == 'barchart'">
                    <dragable-view class="chart-wrapper" :data="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'linechart'">
                    <dragable-view class="chart-wrapper" :data="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'piechart'">
                    <dragable-view class="chart-wrapper" :data="wid.data" :labels="wid.label"/>
                  </div>
                  <div v-else-if="wid.chart == 'chart'">
                    <dragable-view class="chart-wrapper" :data="wid.data" :labels="wid.label"/>
                  </div>
                </b-card>
            </grid-item>
        </grid-layout>
  </div>
</template>

<script>
  import DragableView from './DragableView'
  import DragableViewItem from './DragableViewItem'
  import moment from 'moment'
  import VueGridLayout from 'vue-grid-layout'

  var GridLayout = VueGridLayout.GridLayout;
  var GridItem = VueGridLayout.GridItem;

export default {
  name: 'dashboard',
  components: {
    DragableView,
    DragableViewItem,
    GridLayout,
    GridItem,
  },
  data () {
    return {
      gridContainer: null,
      grid: null,
      widgets: [],
      label: [],
      dictUser: {},
      dataChartUser: [10, 39, 10, 40, 39, 0, 0],
      chart: null,
    }
  },
  mounted () {
    var options = {
        cellHeight: 80,
        verticalMargin: 10
    }
    this.loadDefaultCharts();
    this.fetchData();
  },
  methods: {
    formatDate (d) {
      return moment(new Date(d)).format('MMMM Do YYYY');
    },
    fetchData () {
      this.$raptor.Inventory().list()
      .then((list) => {
        // this.$log.debug('Loaded %s device list', list.length);
          // console.log(list);
          this.extractChartDataDev(list);
          this.$data.label = Object.keys(this.$data.dictUser);
          this.chart = "barchart"
        })
      .catch(function(e) {
        console.log(e)
        console.log(JSON.stringify(e))
        if(e.toString().indexOf("Unauthorized") !== -1) {
          context.$raptor.Auth().logout();
          context.$router.push("/pages/login");
        }
      });
      // this.fetchDevices(this.selectedDevice);
    },
    loadDefaultCharts() {
      this.widgets.push({x:0,y:0,w:4,h:7,i:"0", chart: "barchart", data:[10, 39, 10, 40, 39, 0, 0], labels:"label"})
      this.widgets.push({x:4,y:0,w:4,h:7,i:"1", chart: "linechart", data:[10, 39, 10, 40, 39, 0, 0], labels:"label"})
      this.widgets.push({x:8,y:0,w:4,h:7,i:"2", chart: "piechart", data:[10, 39, 10, 40, 39, 0, 0], labels:"label"})
      this.widgets.push({x:0,y:7,w:4,h:7,i:"3", chart: "chart", data:[10, 39, 10, 40, 39, 0, 0], labels:"label"})
    },
    extractChartDataDev (d) {
      for (var i = 0, len = d.length; i < len; i++) {
        let s = d[i]
        let sDate = this.formatDate(s.createdAt * 1000).split(' ')[0]
        this.$data.dictUser[sDate] = this.$data.dictUser[sDate] ? this.$data.dictUser[sDate] + 1 : 1;
      }
    },
    addWidget() {
      this.widgets.push({x:0,y:0,w:4,h:7,i:this.widgets.length+1, chart: "chart", data:[10, 39, 10, 40, 39, 0, 0], labels:"label"})
    },
  }
}
</script>
