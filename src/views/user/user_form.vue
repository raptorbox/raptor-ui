<template>
<b-card>

  <div slot="header" class="row">
    <div class="col-md-12">
      <h3>
          <i class="fa fa-user"></i>
          {{ this.userId ? 'Edit' : 'New' }} User</h3>
    </div>
  </div>

  <div class="row">
    <div class="col-md-6">
      <div class="form-group" :class="{error: validation.hasError('username')}">
        <div class="content">
          <b-form-fieldset description="Please enter an username" label="Username" :horizontal="false">
            <b-form-input type="text" placeholder="Enter username" v-model="username"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message text-danger">{{ validation.firstError('username') }}</div>
      </div>
      <div class="form-group" :class="{error: validation.hasError('email')}">
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
      </div>
    </div>

    <div class="col-md-6">

      <b-form-fieldset label="Roles" :horizontal="false">
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
      </b-form-fieldset>
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
const defaultData = () => {
  const d = new Raptor.models.User().defaultFields()
  const u = {}
  for (let p in d) {
    u[p] = null
  }
  return u
}

export default {
  name: 'user_form',
  data() {
    return {
      userId: null,
      loading: false,
      error: false,
      loggedInUser: null,
      availRoles: [],
      password1: null,
      // application specific
      appId: null,
      ...defaultData()
    }
  },
  validators: {
    email: function(value) {
      return Validator.value(value).required('Email is required').email('Email is not valid');
    },
    username: function(value) {
      return Validator.value(value).required('Username is required');
    },
    'password, password1': function(password, password1) {
      if (this.validation.isTouched('password1')) {
        return Validator.value(password).required('Password is required').match(password1, 'Passwords does not match');
      }
    }
  },
  mounted() {
    this.loggedInUser = this.$raptor.Auth().getUser()

    this.appId = this.$route.params.appId
    console.log(this.appId)

    //load roles async
    this.loadRoles().catch((e) => {
        this.$log.error("Failed to load roles: %s", e.message)
        this.$log.debug(e)
    })

    this.userId = this.$route.params.userId

    if (!this.userId) {
      this.enabled = true
      this.roles = []
    } else {
      this.$log.debug('Load %s ', this.userId)
      this.load(this.userId)
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
    load(userId) {
      this.loading = true
      this.$raptor.Admin().User().read(userId)
        .then((user) => {
          this.$log.debug('User %s loaded', userId)
          this.loading = false
          Object.assign(this.$data, user)
        })
        .catch((e) => {
          this.$log.console.warn();
          ('Failed to load user: %s', e.message)
          this.$log.debug(e)
          this.loading = false
        })
    },
    cancel() {
      this.$router.push("/admin/users")
    },
    save() {

      var context = this
      const d = defaultData()
      const u = {}
      for (let p in d) {
        u[p] = this[p]
      }

      u.roles = this.roles

      if (this.userId) {
        u.id = this.userId
      } else {
        u.ownerId = this.loggedInUser.id
        u.domain = this.appId
      }

      this.loading = true
      console.log(u)
      this.$log.debug('Saving user', u)

      this.$validate()
        .then((success) => {

          if (!success) {
            return Promise.reject(new Error("Validation failed"))
          }

          context.$raptor.Admin().User().save(u)
            .then((u) => {
              this.$log.debug('User %s saved', u.id)
              this.loading = false
              if(!this.appId) {
                this.$router.push("/admin/users")
              } else {
                this.$router.push("/admin/users/" + this.appId)
              }
            })
            .catch((e) => {
              this.$log.error("Error saving user: %s", e.message)
              this.$log.debug(e)
            })
        })
    }
  }
}
</script>
