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

      <!-- <b-form-fieldset description="Please select a device" label="Password" :horizontal="false">
        <b-form-input type="password" placeholder="Enter password" v-model="password"></b-form-input>
      </b-form-fieldset> -->

    </div>

    <div class="col-md-6">

      <!-- <b-form-fieldset label="Roles" :horizontal="false">
        <b-form-checkbox v-model="roles" :plain="true" value="admin">Admin</b-form-checkbox><br>
        <b-form-checkbox v-model="roles" :plain="true" value="super_admin">Super Admin</b-form-checkbox><br>
      </b-form-fieldset> -->

      <!-- <b-form-fieldset label="Status" :horizontal="false">
        <b-form-checkbox v-model="enabled">enabled</b-form-checkbox>
      </b-form-fieldset> -->
    </div>
    <!--/.col-->
  </div>
  <!--/.row-->

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
  import Raptor from 'raptor-sdk'
  const defaultData = () => {
    console.log("***************************************")
    console.log("Device Model")
    let d1 = new Raptor.models.Device()
    console.log(d1)
    let d = d1.defaultFields()

    console.log("defaultFields: " + d)

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
    data() {
      return {
        loading: false,
        error: false,
        ...defaultData()
      }
    },
    mounted() {
      if (this.$route.params.deviceId) {
        this.$log.debug('Load %s ', this.$route.params.deviceId)
        this.load(this.$route.params.deviceId)
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

        const d = defaultData()
        const u = {}
        for(let p in d) {
          u[p] = this[p]
        }
        this.loading = true
        this.$log.debug('Saving device', u)

        if (this.$route.params.deviceId) {
          this.$raptor.Inventory().update(u)
          .then((device) => {
            this.$log.debug('device %s saved', device.id)
            this.loading = false
          })
          .catch((e) => {
            this.$log.debug('Failed to save device')
            this.$log.error(e)
            this.loading = false
          })
        } else {
          this.$log.debug('creating device', u)
          this.$raptor.Inventory().create(u)
          .then((device) => {
            this.$log.debug('device %s created', device.id)
            this.loading = false
          })
          .catch((e) => {
            this.$log.debug('Failed to create device')
            this.$log.error(e)
            this.loading = false
          })
        }
        this.$router.push("/inventory/list")
      }
    }
  }
</script>