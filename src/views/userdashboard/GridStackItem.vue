<template>
    <div class="animated fadeIn">
        <div class="grid-stack-item-content">
            <b-card class="bg-primary" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
                <slot></slot>
            </b-card>
        </div>
    </div>
</template>

<script>
    import DragableView from './DragableView'
    export default {
        name: 'GridStackItem',
        component: {
            DragableView
        },
        props: ['height', 'data', 'chart', 'labels', 'width'],
        data() {
            return {
                greeting: 'Hello',
                dictUser: {},
                dataChartUser: [10, 39, 10, 40, 39, 0, 0],
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