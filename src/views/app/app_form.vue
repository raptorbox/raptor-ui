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
                <b-form-checkbox v-model="roles" :plain="true" :value="role.name">
                  <span :title="role.name">{{ role.name.length > 12 ? role.name.substr(0, 10) + '..' : role.name  }}</span>
                </b-form-checkbox>
              </li>
            </ul>
          </b-form-fieldset>

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

    <b-card header="Users">
      <div class="row">
        <b-table no-local-sorting small responsive show-empty :items="app.users" :fields="fieldsUsers">
        
          <template slot="userid" scope="row">
            <b-badge size="sm" variant="light">{{row.item.id}}</b-badge>
          </template>
          <!-- <template slot="name" scope="row">
            <b-button variant="link">{{row.item.name}}</b-button>
          </template> -->
          <template slot="roles" scope="row">
              <b-badge v-for="role in row.item.roles" :key="role" :variant="role === 'admin' ? 'info' : 'light'">
                  {{ role }}
              </b-badge>
          </template>
          <template slot="status" scope="row">
              <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
          </template>
          <template slot="actions" scope="row">
              <b-button title="Delete user" variant="danger" @click="remove(row.item)">
                <i class="fa fa-remove fa-lg"></i>
              </b-button>
          </template>
        </b-table>
      </div>
    </b-card>

    <b-card header="Devices">
      <div class="row">
        <b-table no-local-sorting small responsive show-empty :items="app.devices" :fields="fieldsDevices">
        
          <template slot="deviceId" scope="row">
            <b-badge size="sm" variant="light">{{row.item.id}}</b-badge>
          </template>
          <!-- <template slot="name" scope="row">
            <b-button variant="link"> {{row.item.name}} </b-button>
          </template> -->
          <template slot="roles" scope="row">
              <b-badge v-for="role in row.item.roles" :key="role" :variant="role === 'admin' ? 'info' : 'light'">
                  {{ role }}
              </b-badge>
          </template>
          <template slot="status" scope="row">
              <b-badge :variant="row.item.enabled ? 'success' : 'warning'">{{row.item.enabled ? 'Enabled' : 'Disabled'}}</b-badge>
          </template>
          <template slot="actions" scope="row">
              <b-button title="Delete device" variant="danger" @click="remove(row.item)">
                <i class="fa fa-remove fa-lg"></i>
              </b-button>
          </template>
        </b-table>
      </div>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'user_form',
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
        roles: {
          label: 'Roles',
          sortable: true,
        },
        status: {
          label: 'Status'
        },
        actions: {}
      },
    }
  },
  mounted() {
    this.loggedInUser = this.$raptor.Auth().getUser()

    //load roles async
    this.loadRoles().catch((e) => {
        this.$log.error("Failed to load roles: %s", e.message)
        this.$log.debug(e)
    })

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
          this.app = app
          app.roles.forEach((role) => { this.roles.push(role.name) })
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

      this.loading = true
      this.$log.debug('Saving user', this.app.name)
      let json = {
        name: this.app.name,
        role: this.roles,
        users: [],
        devices: []
      }
      if(this.app.id) {
        json.id = this.app.id
      }

      this.$raptor.App().save(json)
        .then((app) => {
          this.$log.debug('App %s saved', app.id)
          this.loading = false
          this.$router.push("/admin/applications")
        })
        .catch((e) => {
          this.$log.error("Error saving app: %s", e.message)
          this.$log.debug(e)
        })
    }
  }
}
</script>
