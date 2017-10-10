<template>
  <div class="animated fadeIn">
        <p>
          <button @click="addWidget">
            Add Widget
          </button>
        </p>
  
        <div class="grid-stack">
          <div v-for="n in widgets"></div>
        </div>
  </div>
</template>

<script>
  import GridStackItem from './GridStackItem'
  import gridstack from 'gridstack'
  import $ from 'jquery'

export default {
  name: 'dashboard',
  components: {
    GridStackItem
  },
  data () {
    return {
      gridContainer: null,
      grid: null,
      widgets: null
    }
  },
  mounted () {
    var options = {
        cellHeight: 80,
        verticalMargin: 10
    }
    $('.grid-stack').gridstack(options);
    this.gridContainer = $('.grid-stack');
    this.grid = this.gridContainer.data('gridstack');
  },
  ready () {
    var options = {
        cellHeight: 80,
        verticalMargin: 10
    }
    $('.grid-stack').gridstack(options);
  },
  
  methods: {
    addWidget() {
      let widget = this.grid.addWidget(`
        <grid-stack-item data-gs-x="0" data-gs-y="0" data-gs-width="1" data-gs-height="1">
          <div class="grid-stack-item-content ui-draggable-handle" style="background: red; color: white;">
            <p>Vue (added)</p>
          </div>
        </grid-stack-item>
      `, 0, 0, 1, 1, true)
    }
  }
}
</script>
