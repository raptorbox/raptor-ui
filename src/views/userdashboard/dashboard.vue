<template>
  <div class="animated fadeIn">
        <p>
          <button @click="addWidget">
            Add Widget
          </button>
        </p>

        <!-- <div class="grid-stack">
        </div> -->

        <div :height="70" :width="70" style="border: 1px solid red; position: relative;">
          <vue-draggable-resizable :w="160" :h="160" v-on:dragging="onDrag" v-on:resizing="onResize" :parent="true">
            <b-card class="bg-primary" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
              <div class="card-body pb-0">
                <p>Total Devices</p>
              </div>
              <dragable-view class="chart-wrapper" style="height:70px;" :data="dataChartUser" :labels="label" height="70" width="70"/>
            </b-card>
          </vue-draggable-resizable>
        </div>
  </div>
</template>

<script>
  import DragableView from './DragableView'
  import GridStackItem from './GridStackItem'
  import gridstack from 'gridstack'
  import $ from 'jquery'
  import moment from 'moment'
  import Vue from 'vue'
  import VueDraggableResizable from 'vue-draggable-resizable'
  Vue.component('vue-draggable-resizable', VueDraggableResizable)

export default {
  name: 'dashboard',
  components: {
    GridStackItem,
    DragableView
  },
  data () {
    return {
      gridContainer: null,
      grid: null,
      widgets: [],
      label: [],
      dictUser: {},
      dataChartUser: [10, 39, 10, 40, 39, 0, 0],
      width: 70,
      height: 70,
      x: 0,
      y: 0,
      chart: null
    }
  },
  mounted () {
    var options = {
        cellHeight: 80,
        verticalMargin: 10
    }
    // $('.grid-stack').gridstack(options);
    // this.gridContainer = $('.grid-stack');
    // this.grid = this.gridContainer.data('gridstack');
    // this.loadDefaultCharts();
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
      this.chart = `<div class="grid-stack-item" data-gs-x="0" data-gs-y="0" data-gs-width="150" data-gs-height="70">
              <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
              </div>
          </div>`
      this.widgets.push(`
          <div class="grid-stack-item" data-gs-x="0" data-gs-y="0" data-gs-width="150" data-gs-height="70">
              <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
                <dragable-view class="chart-wrapper" style="height:70px;" :data="dataChartUser" :labels="label" height="70"/>
              </div>
          </div>`);
      this.widgets.push(`
          <grid-stack-item data-gs-x="0" data-gs-y="0" data-gs-width="1" data-gs-height="1">
              <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
                <p>Vue (added)</p>
              </div>
          </grid-stack-item>`);
      this.widgets.push(`
          <grid-stack-item data-gs-x="0" data-gs-y="0" data-gs-width="1" data-gs-height="1">
              <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
                <p>Vue (added)</p>
              </div>
          </grid-stack-item>`)
      for (var i = 0; i < this.widgets.length; i++) {
        this.grid.addWidget(this.widgets[i], 0, 0, 1, 1, true)
      }
    },
    extractChartDataDev (d) {
      for (var i = 0, len = d.length; i < len; i++) {
        let s = d[i]
        let sDate = this.formatDate(s.createdAt * 1000).split(' ')[0]
        this.$data.dictUser[sDate] = this.$data.dictUser[sDate] ? this.$data.dictUser[sDate] + 1 : 1;
      }
    },
    addWidget() {
      let widget = this.grid.addWidget(`
        <grid-stack-item data-gs-x="0" data-gs-y="0" data-gs-width="1" data-gs-height="1">
          <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
            <p>Vue (added)</p>
          </div>
        </grid-stack-item>
      `, 0, 0, 1, 1, true)
      this.grid.addWidget(GridStackItem,0,0,1,1,true)
    },
    onResize: function (x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    },
    onDrag: function (x, y) {
      this.x = x
      this.y = y
    },
  }
}
</script>
