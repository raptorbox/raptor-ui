<template>
    <div class="animated fadeIn">
        <div class="grid-stack-item-content">
            {{greeting}}
            {{chart}}
            <b-card class="bg-primary" :no-block="true" style="min-height:160px; max-height:160px; height:160px">
                <div class="card-body pb-0">
                    <p>Total Devices</p>
                </div>
                <span v-if="chart">
                    <dragable-view class="chart-wrapper" style="height:70px;" :data="data" :labels="label" height="70" width="70"/>
                </span>
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
        },
        computed: {
          chartData: function() {
            return this.data
          }
        },
        methods: {
        },
        watch: {
            data: function() {
                console.log(this.data)
                console.log(this.label)
                console.log(this.chart)
                console.log(this.greeting)
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