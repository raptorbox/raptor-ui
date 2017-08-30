<template>
<b-card>
  <div class="row">
    <div class="col-md-6">

      <!-- <div slot="header">
        <strong>Basic Form</strong> Elements
      </div> -->

      <b-form-fieldset description="Please enter an username" label="Username" :horizontal="false">
        <b-form-input type="text" placeholder="Enter username" v-model="username"></b-form-input>
      </b-form-fieldset>

      <b-form-fieldset description="Please enter an email" label="Email" :horizontal="false">
        <b-form-input type="email" placeholder="Enter email" v-model="email"></b-form-input>
      </b-form-fieldset>

      <b-form-fieldset description="Please enter a password" label="Password" :horizontal="false">
        <b-form-input type="password" placeholder="Enter password" v-model="password"></b-form-input>
      </b-form-fieldset>

    </div>

    <div class="col-md-6">

      <b-form-fieldset label="Roles" :horizontal="false">
        <b-form-checkbox v-model="roles" :plain="true" value="admin">Admin</b-form-checkbox><br>
        <b-form-checkbox v-model="roles" :plain="true" value="super_admin">Super Admin</b-form-checkbox><br>
      </b-form-fieldset>

      <b-form-fieldset label="Status" :horizontal="false">
        <b-form-checkbox v-model="enabled">enabled</b-form-checkbox>
      </b-form-fieldset>
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
    const d = new Raptor.models.Token().defaultFields()
    const u = {}
    for(let p in d) {
      u[p] = null
    }
    return u
}

export default {
  name: 'token_form',
  data() {
    return {
      loading: false,
      error: false,
      ...defaultData()
    }
  },
  mounted() {
    if (this.$route.params.tokenId) {
      this.$log.debug('Load %s ', this.$route.params.tokenId)
      this.load(this.$route.params.tokenId)
    }
  },
  methods: {
    load(tokenId) {
      this.loading = true
      this.$raptor.Admin().Token().read(tokenId)
        .then((user) => {
          this.$log.debug('Token %s loaded', tokenId)
          this.loading = false
          Object.assign(this.$data, token)
        })
        .catch((e) => {
          this.$log.debug('Failed to load token')
          this.$log.error(e)
          this.loading = false
        })
    },
    cancel() {
        this.$router.push("/admin/tokens")
    },
    save() {

      const d = defaultData()
      const t = {}
      for(let p in d) {
          t[p] = this[p]
      }

      this.loading = true
      this.$log.debug('Saving token', t)
      this.$raptor.Admin().Token().save(u)
        .then((u) => {
          this.$log.debug('Token %s saved', u.uuid)
          this.loading = false
        })
        .catch((e) => {
          this.$log.debug('Failed to save token')
          this.$log.error(e)
          this.loading = false
        })
    }
  }

}
</script>
