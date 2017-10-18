<template>
    <div class="animated fadeIn">
        <b-card class="bg-primary">
            <slot></slot>
        </b-card>
    </div>
</template>

<script>
    import DragableView from './DragableView'
    export default {
        name: 'GridStackItem',
        component: {
            DragableView
        },
        props: ['data', 'chart', 'labels'],
        data() {
            return {
                greeting: 'Hello',
                dictUser: {},
                dataChartUser: [10, 39, 10, 40, 39, 0, 0],
                width: 70,
                height: 70,
                x: 0,
                y: 0,
                label: [],
            }
        },
        mounted () {
            console.log("mounted data " + this.data)
            console.log("mounted chart " + this.chart)
        },
        computed: {
          chartData: function() {
            console.log("mounted data " + this.data)
            console.log("mounted chart " + this.chart)
            return this.data
          }
        },
        methods: {
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
        },
        watch: {
            data: function() {
                console.log(this.data)
                console.log(this.labels)
                console.log(this.chart)
                console.log(this.greeting)
            },
            chart: function() {
                console.log("chart watch " + this.chart)
            }
        }
    }
</script>

<style scoped>
    grid-stack-tem-content {
        background: red;
        color: white;
    }
</style>