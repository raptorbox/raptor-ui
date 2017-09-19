<template>
  <div class="animated fadeIn row row-fluid">
    <div class="col-lg-12">
      <!-- style="background-color:#f5f5dc" -->
      <b-card> 
        <!-- bg-variant="info" border-variant="light" header="<span class='float-left'>Streams</span> <span class='float-right'><button class='btn btn-primary' type='button' @click='(event) => { onAddStreamButton(event) }'>Add Stream</button></span>"> -->

        <stream class="chart-wrapper" id="streams" :SaveData="SaveData" />

        <div class="float-right" right>
          <button class="btn btn-success" type="button" @click="onSaveStreamButton">Save</button>
        </div>
      </b-card>
    </div>
  </div>
</template>



<script>
  import Stream from './../../components/editStream'
  export default {
    name: 'stream_list',
    components: {
      Stream
    },
    data() {
      return {
        dataSaved: 0,
        SaveData: true
      }
    },
    mounted () {
    },
    methods: {
      onSaveStreamButton () {
        this.SaveData = this.dataSaved++
      }
    }

  }
</script>