<template>
  <div>
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
          <span v-if="availRoles && availRoles.length > 0">
            <b-form-fieldset label="Roles" :horizontal="false">
              <ul class="list-inline row-fluid">
                <li class="list-inline-item col-md-3" v-for="role in availRoles" :key="role.name">
                  <b-form-checkbox v-model="roles" :plain="true" :value="role.name" v-b-tooltip.hover :title="role.permissions">
                    <span :title="role.name">{{ role.name.length > 12 ? role.name.substr(0, 10) + '..' : role.name  }}</span>
                  </b-form-checkbox>
                </li>
              </ul>
            </b-form-fieldset>
            <span v-if="isAllowed()">
              <b-btn @click="addNewRole = !addNewRole" variant="primary">Add New Role</b-btn>
            </span>
          </span>
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


    <!-- role -->
      <b-modal title="Add new role" size="lg" class="modal-info" v-model="addNewRole" @ok="addRoleForUser" @shown="clearFields" ref="modal">
        <form @submit.stop.prevent="hideModalWin">
          <div class="row">
            <div class="col-md-12">
                <b-form-fieldset label="Role Name" :horizontal="false">
                    <b-form-input variant="outline-secondary" v-model="rolename" type="text" placeholder="Enter role name"> </b-form-input>
                </b-form-fieldset>
            </div>
          </div>
        </form>
        <div>
          <div>
            <div class="col-md-12float-right">
              <div class="text-right">
                <b-button class="btn btn-primary" @click="onCreateRoleButton">Add New Role</b-button>
              </div>
            </div>
          </div>
          <b-table no-local-sorting small responsive show-empty :items="listOfPermissions" :fields="rolesFields">
            <template slot="permission" scope="row">
                <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.permission" :options="systemPermissions"> </b-form-select>
            </template>
            <template slot="ownership" scope="row">
                <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.ownership" :options="ownership"> </b-form-select>
            </template>
            <template slot="subject" scope="row">
                <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.subject" :options="subjectTypes"> </b-form-select>
            </template>
          </b-table>
        </div>
      </b-modal>
  </div>
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
      app: null,
      rolename: null,
      listOfPermissions: [],
      systemPermissions: [],
      addNewRole: false,
      rolesFields: [
        {
          key: 'permission',
          label: 'Permission'
        },
        {
          key: 'ownership',
          label: 'Ownership'
        },
        {
          key: 'subject',
          label: 'Subject'
        }
      ],
      roles: [],
      ownership: [{value: 'own', text: 'OWN (Owned devices)'}],
      subjectTypes: [{value: 'device', text: 'Device'},
                     {value: 'user', text: 'User'},
                     {value: 'app', text: 'Application'},
                     {value: 'tree', text: 'Tree'},
                     {value: 'stream', text: 'Stream (Data)'},
                     {value: 'token', text: 'Token (used to query API)'},
                     {value: 'client', text: 'OAuth2 Client'}],
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
    // console.log(this.loggedInUser)
    this.userId = this.$route.params.userId

    this.appId = this.$route.params.appId
    // console.log(this.appId)

    Object.values(this.$raptor.permissions).forEach((e) => {
      if(e == 'administration')
        e = 'admin'
      this.systemPermissions.push({value:e, text:e})
    })

    if(this.appId) {
      this.loadApp()
    }
    if(this.isAllowed()) {
      //load roles async
      this.loadRoles().catch((e) => {
          this.$log.error("Failed to load roles: %s", e.message)
          this.$log.debug(e)
      })
    }
    if (!this.userId) {
      this.enabled = true
      this.roles = []
    } else {
      this.$log.debug('Load %s ', this.userId)
      this.load(this.userId)
    }
  },
  methods: {
    isAllowed() {
      //TODO add local permission checks on sdk
      if(this.loggedInUser && this.loggedInUser.roles.indexOf("admin") > -1) {
        return true
      }
    },
    loadRoles() {
      return this.$raptor.Admin().Role().list().then((pager) => {
        this.availRoles.length = 0
        pager.getContent().forEach((role) => {
          this.availRoles.push(role)
        })
        // let list = pager.getContent()
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
          if(this.availRoles.length === 0) {
            user.roles.forEach((e) => this.availRoles.push({name: e, permissions: e}))
          }
        })
        .catch((e) => {
          this.$log.warn();
          ('Failed to load user: %s', e.message)
          this.$log.debug(e)
          this.loading = false
        })
    },
    loadApp() {
      this.$raptor.App().read(this.appId).then((app) => {
        this.app = app
        this.roles = []
        this.availRoles = app.roles
      }).catch((e) => {
        this.$log.warn(e)
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

      if(!this.appId) {
        u.roles = this.roles
      }
      if (this.userId) {
        u.id = this.userId
      } else {
        u.ownerId = this.loggedInUser.id
        // u.domain = this.appId
      }

      this.loading = true
      // console.log(u)
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
                this.addToApp(u.id)
                this.$router.push("/admin/users/" + this.appId)
              }
            })
            .catch((e) => {
              this.$log.error("Error saving user: %s", e.message)
              // this.$log.debug(e)
              this.loading = false
            })
        })
    },
    addToApp(id) {
      this.app.users.push({id: id, roles: this.roles})
      this.$raptor.App().save(this.app)
        .then((app) => {
          this.$log.debug('App %s saved', app.id)
        })
        .catch((e) => {
          this.$log.error("Error saving app: %s", e.message)
          this.$log.debug(e)
        })
    },
    // permissions creation
    onCreateRoleButton() {
      this.listOfPermissions.push({permission: null, onwership: null, subject: null})
    },
    addRoleForUser() {
      let listOfPermission = []
      for (var i = 0; i < this.listOfPermissions.length; i++) {
          let perm = this.listOfPermissions[i].permission
          if(this.listOfPermissions[i].ownership) {
              perm = perm + '_' + this.listOfPermissions[i].ownership
          }
          if(this.listOfPermissions[i].subject) {
              perm = perm + '_' + this.listOfPermissions[i].subject
          }
          listOfPermission.push(perm)
      }
      let role = {name: this.rolename, permissions: listOfPermission}
      this.$raptor.Admin().Role().create(role).then(() => {
        this.loadRoles()
      })
      this.clearFields()
    },
    clearFields() {
      this.listOfPermissions = []
      this.rolename = null
    },
  }
}
</script>
