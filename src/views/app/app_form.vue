<template>
  <div>
    <b-card>

      <div slot="header" class="row">
        <div class="col-md-12">
          <h3>{{ this.appId ? 'Edit' : 'New' }} Application</h3>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <div class="content">
              <b-form-fieldset description="Please enter application name" label="Name" :horizontal="false">
                <b-form-input type="text" placeholder="Enter application name" v-model="app.name"></b-form-input>
              </b-form-fieldset>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <b-form-fieldset label="Roles" :horizontal="false">
            <ul class="list-inline row-fluid">
              <li class="list-inline-item col-md-3" v-for="role in availRoles" :key="role.name">
                <b-form-checkbox v-model="selectedRoles" v-b-tooltip.hover :title="role.permissions" :plain="true" :value="role">
                  <span :title="role.name">{{ role.name.length > 12 ? role.name.substr(0, 10) + '..' : role.name }}</span>
                </b-form-checkbox>
              </li>
            </ul>
          </b-form-fieldset>
          <b-btn @click="addNewRole = !addNewRole" variant="primary">Add New Role</b-btn>

          <b-form-fieldset label="Status" :horizontal="false">
            <b-form-checkbox v-model="app.enabled">Enabled</b-form-checkbox>
          </b-form-fieldset>
        </div>
      </div>

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
      </div>
    </b-card>

    <!-- role -->
      <b-modal title="Add new role" size="lg" class="modal-info" v-model="addNewRole" @ok="addRoleToApp" @shown="clearFields" ref="modal">
        <form @submit.stop.prevent="hideModalWin">
          <div class="row">
            <div class="col-md-12">
              <div class="form-group" :class="{error: validation.hasError('rolename')}">
                  <div class="content">
                    <b-form-fieldset label="Role Name" :horizontal="false">
                        <b-form-input variant="outline-secondary" v-model="rolename" type="text" placeholder="Enter role name"> </b-form-input>
                    </b-form-fieldset>
                  </div>
                <div class="message text-danger">{{ validation.firstError('rolename') }}</div>
              </div>
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
                <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.permission" :options="permissions"> </b-form-select>
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

    <!-- users -->
    <b-card>
      <div slot="header" class="row">
        <div class="col-md-6 float-left">
          <h5>Users</h5>
        </div>
        <div class="col-md-6 float-right">
          <div class="text-right">
            <b-button class="list-inline-item" title="Add user" variant="primary" :to="{ name: 'UsersListAddToApp', params: { appId: appId, rolesInApplication: availRoles, appUsers: app.users }}">
              <i class="fa fa-plus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div>
        <b-table no-local-sorting small responsive show-empty :items="app.users" :fields="fieldsUsers" :current-page="currentPageUser" :per-page="5" >
          <template slot="userid" scope="row">
            <b-badge size="sm" variant="light" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">{{row.item.id}}</b-badge>
          </template>
          <!-- <template slot="name" scope="row" v-if="row.item.name">
            <span v-if="row.item.name">
              <b-button variant="link" :to="{ name: 'UsersUpdate', params: { userId: row.item.id }}">
              {{row.item.name}}
              </b-button>
            </span>
          </template> -->
          <template slot="roles" scope="row">
              <span v-if="row.item.roles.length > 0">
                  <b-badge v-for="role in row.item.roles" :key="role" :variant="role === 'admin' ? 'info' : 'light'" @click="openModalWin(row.item)">
                      {{ role }}
                  </b-badge>
              </span>
              <span v-else>
                <b-button class="list-inline-item" title="Assign Role" variant="primary" @click="openModalWin(row.item)">Assign Role</b-button>
              </span>
          </template>
          <template slot="status" scope="row">
              <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
          </template>
          <template slot="actions" scope="row">
              <b-button title="Delete user" variant="danger" @click="removeUser(row.item)">
                <i class="fa fa-remove fa-lg"></i>
              </b-button>
          </template>
        </b-table>
        <div>
          <b-pagination align="center" :total-rows="app.users.length" :per-page="5" v-model="currentPageUser" prev-text="Prev" next-text="Next"/>
        </div>
      </div>
    </b-card>

    <!-- devices -->
    <b-card>
      <div slot="header" class="row">
        <div class="col-md-6 float-left">
          <h5>Devices</h5>
        </div>
        <div class="col-md-6 float-right">
          <div class="text-right">
            <!-- <b-button class="list-inline-item" title="Add device" variant="primary" :to="{ name: 'DeviceListAddToApp', params: { appId: appId, rolesInApplication: availRoles, appDevices: app.devices }}">
              <i class="fa fa-plus"></i>
            </b-button> -->
            <b-button class="list-inline-item" title="Add device" variant="primary" :to="{ name: 'DeviceListAddToApp', params: { appId: appId }}">
              <i class="fa fa-plus"></i>
            </b-button>
          </div>
        </div>
      </div>
      <div>
        <b-table no-local-sorting small responsive show-empty :items="devices" :fields="fieldsDevices" @sort-changed="sortingChanged">

          <template slot="deviceId" scope="row">
            <b-badge size="sm" variant="light">{{row.item.id}}</b-badge>
          </template>
          <template slot="name" scope="row">
            <b-button variant="link"> {{row.item.name}} </b-button>
          </template>
          <!-- <template slot="roles" scope="row">
              <b-badge v-for="role in row.item.roles" :key="role" :variant="role === 'admin' ? 'info' : 'light'">
                  {{ role }}
              </b-badge>
          </template> -->
          <!-- <template slot="status" scope="row">
              <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
          </template> -->
          <template slot="actions" scope="row">
              <b-button title="Delete device" variant="danger" @click="removeDevice(row.item)">
                <i class="fa fa-remove fa-lg"></i>
              </b-button>
          </template>
        </b-table>
        <div>
          <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" @change="pageChanged" />
        </div>
      </div>
    </b-card>

    <!-- update permission for a user -->
    <b-modal title="Update Roles For User" size="lg" class="modal-info" v-model="updateRoles" @ok="onUpdateRolesForUser">
      <b-form-fieldset description="UserId" label="UserId" :horizontal="false">
        <b-form-input type="text" placeholder="Enter Widget Name" v-model="modalWin.id" disabled></b-form-input>
      </b-form-fieldset>
      <b-form-fieldset label="Roles of User in application" :horizontal="false">
        <ul class="list-inline row-fluid">
          <li class="list-inline-item col-md-3" v-for="role in modalWin.availRoles" :key="role.name">
            <b-form-checkbox v-model="modalWin.selectedRoles" :plain="true" :value="role.name">
              <span :title="role.name">{{ role.name }}</span>
            </b-form-checkbox>
          </li>
        </ul>
      </b-form-fieldset>
    </b-modal>

  </div>
</template>

<script>
var SimpleVueValidation = require('simple-vue-validator');
var Validator = SimpleVueValidation.Validator;

export default {
  name: 'user_form',
  // props: ['usersToAdd'],
  data() {
    return {
      appId: null,
      loading: false,
      error: false,
      loggedInUser: null,
      availRoles: [],
      app: {
        name: null,
        roles: [],
        devices: [],
        users: []
      },
      roles: [],
      fieldsUsers: {
        userid: {
          label: 'Id',
          sortable: true,
        },
        // name: {
        //   label: 'Name',
        //   sortable: true,
        // },
        roles: {
          label: 'Roles',
          sortable: true,
        },
        status: {
          label: 'Status'
        },
        actions: {}
      },
      fieldsDevices: {
        deviceId: {
          label: 'Id',
          sortable: true,
        },
        name: {
          label: 'Name',
          sortable: true,
        },
        // roles: {
        //   label: 'Roles',
        //   sortable: true,
        // },
        // status: {
        //   label: 'Status'
        // },
        actions: {}
      },
      // devices
      devices: [],
      // pagination
      perPage: 5,
      totalRows: 0,
      currentPage: 1,
      currentPageUser: 1,
      // roles
      selectedRoles: [],
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
      permissions: [],
      // {value: 'all', text: 'All'}
      ownership: [{value: 'own', text: 'OWN (Owned devices)'}],
      subjectTypes: [{value: 'device', text: 'Device'},
                     {value: 'user', text: 'User'},
                     {value: 'app', text: 'Application'},
                     {value: 'tree', text: 'Tree'},
                     {value: 'stream', text: 'Stream (Data)'},
                     {value: 'token', text: 'Token (used to query API)'},
                     {value: 'client', text: 'OAuth2 Client'}],
      updateRoles: false,
      modalWin: {},
      rolename: null,
      listOfPermissions: [],
      addNewRole: false,
    }
  },
  validators: {
    rolename: function(value) {
      return Validator.value(value).required('Role name is required');
    }
  },
  mounted() {
    this.loggedInUser = this.$raptor.Auth().getUser()

    Object.values(this.$raptor.permissions).forEach((e) => {
      if(e == 'administration')
        e = 'admin'
      this.permissions.push({value:e, text:e})
    })

    this.appId = this.$route.params.appId

    if (!this.appId) {
      this.enabled = true
      this.roles = []
    } else {
      this.$log.debug('Load %s ', this.appId)
      this.load(this.appId)
      this.loadDevices(this.appId)
    }
  },
  methods: {
    // loadRoles() {
    //   return this.$raptor.Admin().Role().list().then((pager) => {
    //     this.availRoles.length = 0
    //     pager.getContent().forEach((role) => {
    //       this.availRoles.push(role)
    //     })
    //     return Promise.resolve()
    //   })
    // },
    load(appId) {
      this.loading = true
      this.$raptor.App().read(appId)
        .then((app) => {
          this.$log.debug('app %s loaded', appId)
          this.loading = false
          this.app = app
          app.roles.forEach((role) => { this.availRoles.push(role) })
          this.selectedRoles = this.availRoles
        })
        .catch((e) => {
          this.$log.warn();
          ('Failed to load app: %s', e.message)
          this.$log.debug(e)
          this.loading = false
        })
    },
    loadDevices(appId) {
      this.$log.debug('Fetching device list')
      this.loading = true
      let queryParam = {
        page: this.currentPage-1,
        size: this.perPage,
        sort: this.sortBy,
        sortDir: this.sortDir,
      }
      this.$raptor.Inventory().search({domain: appId}, queryParam)
      .then((pager) => {
        this.$log.debug('Loaded %s device list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        this.totalRows = pager.getTotalElements()
        this.devices = pager.getContent()
      })
      .catch((e) => {
        this.$log.warn('Failed to load device list: %s', e.message)
        this.$log.debug(e)
        this.devices = []
        this.pager = null
        this.loading = false
      })
    },
    cancel() {
      this.$router.push("/admin/applications")
    },
    save(source) {

      var context = this

      this.loading = true
      this.$log.debug('Saving app', this.app.name)
      if(!this.app.users) {
        this.app.users = []
      }

      let json = {
        name: this.app.name,
        roles: this.selectedRoles,
        users: this.app.users
      }
      if(this.app.id) {
        json.id = this.app.id
      }

      this.$raptor.App().save(json)
        .then((app) => {
          this.$log.debug('App %s saved', app.id)
          this.loading = false
          if(source != 'userOpetion') {
            this.$router.push("/admin/applications")
          }
        })
        .catch((e) => {
          this.$log.error("Error saving app: %s", e.message)
          this.$log.debug(e)
        })
    },
    removeUser(user) {
      for (var i = 0; i < this.app.users.length; i++) {
        if (this.app.users[i].id === user.id) {
            this.app.users.splice(i,1)
        }
      }
      this.save('userOpetion')
    },
    removeDevice(device) {
      const deviceId = device && device.id ? device.id : device
      const deviceName = device && device.name ? device.name : device
      var context = this
      this.$dialog.confirm(`Remove device \`${deviceName}\` ?`, {
          html: false,
          okText: 'Remove',
          cancelText: 'Cancel',
        })
        .then(function() {
          // This will be triggered when user clicks on proceed
          context.$log.debug("Deleting %s", deviceId)
          context.$raptor.Inventory().delete({
              id: deviceId
            })
            .then(() => {
              context.$log.debug("Deleted %s", deviceId)
              context.loadDevices(context.appId)
            })
            .catch((e) => {
              context.$log.error("Error deleting %s", e)
            })
        })
    },
    // table functionality and pagination
    pageChanged: function(page) {
      this.currentPage = page
      this.loadDevices(this.appId)
    },
    sortingChanged(ev) {
      this.sortBy = ev.sortBy
      this.sortDir = ev.sortDesc ? 'desc' : 'asc'
      this.loadDevices(this.appId)
    },
    // permissions creation
    onCreateRoleButton() {
      this.listOfPermissions.push({permission: null, onwership: null, subject: null})
    },
    // update user's roles
    onUpdateRolesForUser() {
      this.updateRoles = false
      this.app.users.forEach((e) => {
        if(e.id == this.modalWin.id) {
          e.roles = this.modalWin.selectedRoles
        }
      })
      this.save('userOpetion')
    },
    openModalWin(user) {
      this.modalWin = user
      this.modalWin.selectedRoles = user.roles
      this.modalWin.availRoles = this.availRoles
      this.updateRoles = true
    },
    addRoleToApp(evt) {
      evt.preventDefault()
      if(!this.rolename) {
        this.$validate()
          .then((success) => {

            if (!success) {
              return Promise.reject(new Error("Validation failed"))
            }
        })
      } else {
        this.hideModalWin()
      }
    },
    clearFields() {
      this.listOfPermissions = []
      this.rolename = null
    },
    hideModalWin() {
      let listOfPermission = []
      for (var i = 0; i < this.listOfPermissions.length; i++) {
        let perm = this.listOfPermissions[i].permission
        if(perm){
          if(this.listOfPermissions[i].ownership) {
            perm = perm + '_' + this.listOfPermissions[i].ownership
          }
          if(this.listOfPermissions[i].subject) {
            perm = perm + '_' + this.listOfPermissions[i].subject
          }
          listOfPermission.push(perm)
        } else {
            this.$toasted.show('Please add permissions first.').goAway(3000)
        }
      }
      if(listOfPermission.length > 0) {
        let role = {name: this.rolename, permissions: listOfPermission}
        if(!this.selectedRoles.find(e => e.name === role.name)) {
          this.selectedRoles.push(role)
        }
        console.log(JSON.stringify(this.selectedRoles))
      }
      this.clearFields()
      this.$refs.modal.hide()
    }
  }
}
</script>
