<template>
  <b-card>
    <div class="row">
      <div class="col-md-6">

      <!-- <div slot="header">
        <strong>Basic Form</strong> Elements
      </div> -->
      <div class="form-group" :class="{error: validation.hasError('username')}">
        <div class="content">
          <b-form-fieldset description="Please enter an username" label="Username" :horizontal="false">
            <b-form-input type="text" placeholder="Enter username" v-model="username"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message">{{ validation.firstError('username') }}</div>
      </div>
      <div class="form-group" :class="{error: validation.hasError('email')}">
        <div class="content">
          <b-form-fieldset description="Please enter an email" label="Email" :horizontal="false">
            <b-form-input type="email" placeholder="Enter email" v-model="email"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message">{{ validation.firstError('email') }}</div>
      </div>
      <div class="form-group" :class="{error: validation.hasError('password')}">
        <div class="content">
          <b-form-fieldset description="Please enter a password" label="Password" :horizontal="false">
            <b-form-input type="password" placeholder="Enter password" v-model="password"></b-form-input>
          </b-form-fieldset>
        </div>
        <div class="message">{{ validation.firstError('password') }}</div>
      </div>
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
  var SimpleVueValidation = require('simple-vue-validator');
  var Validator = SimpleVueValidation.Validator;
  const defaultData = () => {
    const d = new Raptor.models.User().defaultFields()
    const u = {}
    for(let p in d) {
      u[p] = null
    }
    console.warn(u);
    return u
  }

  export default {
    name: 'user_form',
    data() {
      return {
        loading: false,
        error: false,
        ...defaultData()
      }
    },
    validators: {
      email: function (value) {
        return Validator.value(value).required().email();
      },
      username: function (value) {
        return Validator.value(value).required();
      },
      password: function (value) {
        return Validator.value(value).required();
      }
    },
    mounted() {
      if (this.$route.params.userId) {
        this.$log.debug('Load %s ', this.$route.params.userId)
        this.load(this.$route.params.userId)
      }
    },
    methods: {
      load(userId) {
        this.loading = true
        this.$raptor.Admin().User().read(userId)
        .then((user) => {
          this.$log.debug('User %s loaded', userId)
          this.loading = false
          Object.assign(this.$data, user)
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list')
          this.$log.error(e)
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
        for(let p in d) {
          u[p] = this[p]
        }
        this.loading = true
        this.$log.debug('Saving user', u)

        this.$validate()
        .then(function (success) {
          if (success) {
            if (context.$route.params.userId) {
              context.$raptor.Admin().User().save(u)
              .then((u) => {
                context.$log.debug('User %s saved', u.uuid)
                context.loading = false
                context.$router.push("/admin/users")
              })
              .catch((e) => {
                context.$log.debug('Failed to save user')
                context.$log.error(e)
                context.loading = false
              })
            } else {
              let roles = Array()
              for(let p in d) {
                if(p == "roles") {
                  roles.push(context[p])
                }
              }
              u['roles'] = roles
              context.$log.debug('creating user', u)
              context.$raptor.Admin().User().create(u)
              .then((u) => {
                context.$log.debug('User %s created', u.uuid)
                context.loading = false
                context.$router.push("/admin/users")
              })
              .catch((e) => {
                context.$log.debug('Failed to create user')
                context.$log.error(e)
                context.loading = false
              })
            }
          }
        });
      }
    }
  }
</script>