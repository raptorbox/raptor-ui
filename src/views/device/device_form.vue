<template>
  <b-card>
    <div class="row">
      <div class="col-md-6">

      <!-- <div slot="header">
        <strong>Basic Form</strong> Elements
      </div> -->

      <b-form-fieldset description="Please enter an device name" label="Name" :horizontal="false">
        <b-form-input type="text" placeholder="Enter device name" v-model="name"></b-form-input>
      </b-form-fieldset>

      <b-form-fieldset description="Please enter a description" label="Description" :horizontal="false">
        <b-form-input type="text" placeholder="Enter description" v-model="description"></b-form-input>
      </b-form-fieldset>
      <span v-if="deviceUserId">
        <b-form-fieldset description="Please enter a UserId" label="Change User" :horizontal="false">
          <b-form-input type="text" placeholder="Enter UserId" v-model="userId"></b-form-input>
        </b-form-fieldset>
      </span>
      <!-- <b-form-fieldset description="Please select a device" label="Password" :horizontal="false">
        <b-form-input type="password" placeholder="Enter password" v-model="password"></b-form-input>
      </b-form-fieldset> -->

    </div>

    <div class="col-md-6">
      <b-form-fieldset label="Device Properties" :horizontal="false">
        <textarea class="col-md-12" rows="8" v-model="propertiesTextArea" placeholder="Enter Device Properties:
        { 
          &quot;userId&quot;:&quot;Eh0ihMBFqmWP7YECvT2uyGcff9A2&quot;,
          &quot;tripId&quot;:&quot;-KuciIGkgMOYKI5Tfa1L&quot;
        }"></textarea>
      </b-form-fieldset>
    </div>
    <!--/.col-->
  </div>
  <!--/.row-->
  <stream class="chart-wrapper" id="streams" :SaveData="SaveData" :deviceData="device" />

  <div class="row">
    <div class="col-md-12">
      <div slot="footer">
        <b-button type="submit" size="sm" variant="primary" class="float-right" @click="save">
          <i class="fa fa-dot-circle-o"></i> Save
        </b-button>
        &nbsp;
        <b-button type="reset" size="sm" variant="danger" class="float-right" @click="cancel">
          <i class="fa fa-ban"></i> Cancel
        </b-button>
      </div>
    </div>
    <!--/.col-->
  </div>
  <!--/.row-->
</b-card>
</template>

<script>
  import Stream from './../components/editStream'
  import Raptor from 'raptor-sdk'
  const defaultData = () => {
    // console.log("***************************************")
    // console.log("Device Model")
    let d1 = new Raptor.models.Device()
    // console.log(d1)
    let d = d1.defaultFields()

    // console.log("defaultFields: " + d)

    // d.streams = new Raptor.models.Stream().defaultFields()
    // d.actions = new Raptor.models.Action().defaultFields()
    // d.settings = new Raptor.models.Settings().defaultFields()
    const u = {}

    for(let p in d) {
      u[p] = null
    }
    /*
    if(d.streams != null) {
      for(let p in d.streams) {
        u.streams[p] = null
      }
    }
    if(d.actions != null) {
      for(let p in d.actions) {
        u.actions[p] = null
      }
    }*/
    console.warn("final object: " + JSON.stringify(u));
    return u
  }

  export default {
    name: 'device_form',
    components: {
      Stream
    },
    data() {
      return {
        loading: false,
        error: false,
        SaveData: false,
        device: null,
        saveIt: 0,
        deviceUserId: "",
        propertiesTextArea: "",
        clone: false,
        ...defaultData()
      }
    },
    mounted() {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
      }
      console.log(this.$route)
      if(this.$route.path.indexOf('clone') != -1) {
        this.clone = true
      }
    },
    methods: {
      load(deviceId) {
        this.loading = true
        this.$raptor.Inventory().read(deviceId)
        .then((device) => {
          this.$log.debug('device %s loaded', device)
          this.loading = false
          this.$data.name = device.name
          this.$data.description = device.description
          this.$data.id = device.id
          this.$data.userId = device.userId
          this.$data.device = device
          this.$data.deviceUserId = device.id
          let prop = JSON.stringify(device.properties)
          if(device.properties && prop != "{}" && !this.clone) {
            this.propertiesTextArea = prop
          }
          Object.assign(this.$data, device)
        })
        .catch((e) => {
          this.$log.debug('Failed to load device')
          this.$log.error(e)
          this.loading = false
        })
      },
      cancel() {
        this.$router.push("/inventory/list")
      },
      save() {
        var context = this
        const d = defaultData()
        const u = {}
        for(let p in d) {
          u[p] = this[p]
        }
        this.loading = true
        this.$log.debug('Saving device', u)
        if(this.properties != null) {
          u.properties = propertiesTextArea
        }
        if (this.$route.params.deviceId && !this.clone) {
          // this.$raptor.Inventory().update(u)
          // .then((device) => {
          //   this.$log.debug('device %s saved', device.id)
          this.device.name = this.$data.name
          this.device.description = this.$data.description
          this.device.userId = this.$data.userId
          console.log(this.saveIt++ + " stupid " + context.SaveData)
          context.SaveData = this.saveIt++;
            // this.loading = false
            // context.$router.push("/inventory/list")
          // })
          // .catch((e) => {
          //   this.$log.debug('Failed to save device')
          //   this.$log.error(e)
          //   this.loading = false
          // })
          context.$router.push("/inventory/list")
        } else {
          u.userId = this.$raptor.Auth().getUser().uuid
          this.$log.debug('creating device', u)
          this.$raptor.Inventory().create(u)
          .then((device) => {
            this.$log.debug('device %s created', device.id)
            this.device = device
            context.SaveData = context.saveIt++
            this.loading = false
            context.$router.push("/inventory/list")
          })
          .catch((e) => {
            this.$log.debug('Failed to create device')
            this.$log.error(e)
            this.loading = false
          })
        }
      }
    }
  }
</script>