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
  <stream class="chart-wrapper" id="streams" :SaveData="SaveData" :dataLoad="dataLoad" :deviceData="device" />

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
    let d1 = new Raptor.models.Device()
    let d = d1.defaultFields()

    const u = {}

    for(let p in d) {
      u[p] = null
    }
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
        dataLoad: false,
        device: null,
        saveIt: 0,
        deviceUserId: "",
        propertiesTextArea: "",
        clone: false,
        // devices of application
        appId: null,
        ...defaultData()
      }
    },
    mounted() {
      this.appId = this.$route.params.appId
      if (this.$route.params.deviceId) {
          this.$log.debug('Load %s ', this.$route.params.deviceId)
          this.load(this.$route.params.deviceId)
      }
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
          this.$data.domain = device.domain
          let prop = JSON.stringify(device.properties)
          if(device.properties && prop != "{}") {
            this.propertiesTextArea = prop
          }
          Object.assign(this.$data, device)
          if(this.clone) {
            this.device.id = null
          }
          this.deviceData = device
          this.dataLoad = true
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
        d.id = null
        const u = {}
        for(let p in d) {
          u[p] = this[p]
        }
        if(this.appId) {
          u.domain = this.appId
        }
        this.loading = true
        this.$log.debug('Saving device', u)
        if(this.propertiesTextArea != null) {
          try {
            u.properties = JSON.parse(this.propertiesTextArea)
          } catch (e) {
            u.properties = {}
          }
        }
        u.name = this.$data.name
        u.description = this.$data.description
        u.userId = this.$data.userId
        if (this.$route.params.deviceId && !this.clone) {
          context.device = u
          context.SaveData = this.saveIt++;
        } else {
          if(this.clone) {
            u.id = null
          }
          u.userId = this.$raptor.Auth().getUser().uuid
          this.$log.debug('creating device', u)
          context.device = u
          context.SaveData = this.saveIt++;
        }
      }
    }
  }
</script>
