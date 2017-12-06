<template>
<b-card>

  <div slot="header" class="row">
    <div class="col-md-12">
      <h3>
          <i class="fa fa-user"></i>
          {{ this.appId ? 'Edit' : 'New' }} User</h3>
    </div>
  </div>

  <div class="row">
    <div class="col-md-6">
      <div class="form-group" :class="{error: validation.hasError('name')}">
        <div class="content">
          <b-form-fieldset description="Please enter application name" label="Name" :horizontal="false">
            <b-form-input type="text" placeholder="Enter application name" v-model="name"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message text-danger">{{ validation.firstError('name') }}</div>
      </div>
      <!-- <div class="form-group" :class="{error: validation.hasError('email')}">
        <div class="content">
          <b-form-fieldset description="Please enter an email" label="Email" :horizontal="false">
            <b-form-input type="email" placeholder="Enter email" v-model="email"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message text-danger">{{ validation.firstError('email') }}</div>
      </div>
      <div class="form-group" :class="{error: validation.hasError('password')}">
        <div class="content">
          <b-form-fieldset description="Please enter a password" label="Password" :horizontal="false">
            <b-form-input type="password" placeholder="Enter password" v-model="password"></b-form-input>
          </b-form-fieldset>
          <b-form-fieldset description="Please re-type the password" label="Confitm Password" :horizontal="false">
            <b-form-input type="password" placeholder="Confirm password" v-model="password1"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message text-danger">{{ validation.firstError('password') }}</div>
      </div> -->
    </div>

    <div class="col-md-6">

      <!-- <b-form-fieldset label="Roles" :horizontal="false">
        <ul class="list-inline row-fluid">
          <li class="list-inline-item col-md-3" v-for="role in availRoles" :key="role.name">
            <b-form-checkbox v-model="roles" :plain="true" :value="role.name">
              <span :title="role.name">{{ role.name.length > 12 ? role.name.substr(0, 10) + '..' : role.name  }}</span>
            </b-form-checkbox>
          </li>
        </ul>
      </b-form-fieldset>

      <b-form-fieldset label="Status" :horizontal="false">
        <b-form-checkbox v-model="enabled">enabled</b-form-checkbox>
      </b-form-fieldset> -->
    </div>
    <!--/.col-->
  </div>
  <!--/.row-->

  <div slot="footer">
    <div class="row">
      <div class="col-md-6 text-left">
        <b-button type="reset" size="lg" variant="danger" @click="cancel">
          <i class="fa fa-undo"></i> Cancel
        </b-button>
      </div>
      <div class="col-md-6 text-right">
        <b-button type="submit" size="lg" variant="primary" @click="save">
          <i class="fa fa-floppy-o"></i> Save
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
var SimpleVueValidation = require('simple-vue-validator');
var Validator = SimpleVueValidation.Validator;

export default {
  name: 'user_form',
  data() {
    return {
      appId: null,
      loading: false,
      error: false,
      loggedInUser: null,
      availRoles: [],
      password1: null,
    }
  },
  validators: {
    username: function(value) {
      return Validator.value(value).required('Username is required');
    },
  },
  mounted() {
    this.loggedInUser = this.$raptor.Auth().getUser()

    //load roles async
    // this.loadRoles().catch((e) => {
    //     this.$log.error("Failed to load roles: %s", e.message)
    //     this.$log.debug(e)
    // })

    this.appId = this.$route.params.appId

    if (!this.appId) {
      this.enabled = true
      this.roles = []
    } else {
      this.$log.debug('Load %s ', this.appId)
      this.load(this.appId)
    }
  },
  methods: {
    loadRoles() {
      return this.$raptor.Admin().Role().list().then((pager) => {
        this.availRoles.length = 0
        pager.getContent().forEach((role) => {
          this.availRoles.push(role)
        })
        return Promise.resolve()
      })
    },
    load(appId) {
      this.loading = true
      this.$raptor.App().read(appId)
        .then((app) => {
          this.$log.debug('app %s loaded', appId)
          this.loading = false
          Object.assign(this.$data, app)
        })
        .catch((e) => {
          this.$log.console.warn();
          ('Failed to load app: %s', e.message)
          this.$log.debug(e)
          this.loading = false
        })
    },
    cancel() {
      this.$router.push("/admin/applications")
    },
    save() {

      var context = this
      const d = defaultData()
      const u = {}
      for (let p in d) {
        u[p] = this[p]
      }

      //needed ?
      u.roles = this.roles

      if (this.appId) {
        u.id = this.appId
      }

      this.loading = true
      this.$log.debug('Saving user', u)

      this.$validate()
        .then((success) => {

          if (!success) {
            return Promise.reject(new Error("Validation failed"))
          }

          context.$raptor.App().save(u)
            .then((app) => {
              this.$log.debug('App %s saved', app.id)
              this.loading = false
              this.$router.push("/admin/applications")
            })
            .catch((e) => {
              this.$log.error("Error saving app: %s", e.message)
              this.$log.debug(e)
            })
        })
    }
  }
}
</script>
