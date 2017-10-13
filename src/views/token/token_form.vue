<template>
  <div>
    <b-card>
      <div class="row">
        <div class="col-md-6">

          <b-form-fieldset description="Please enter an token name" label="Name" :horizontal="false">
            <b-form-input type="text" placeholder="Enter Token Name" v-model="token.name"></b-form-input>
          </b-form-fieldset>

          <b-form-fieldset description="Please enter a secret" label="Secret" :horizontal="false">
            <b-form-input type="text" placeholder="Enter Secret" v-model="token.secret"></b-form-input>
          </b-form-fieldset>

          <span v-if="token && token.token">
            <b-form-fieldset description="Token" label="Secret" :horizontal="false">
              <b-form-input type="text" placeholder="Token" disabled v-model="token.token"></b-form-input>
            </b-form-fieldset>
          </span>

          <div>
            <b-form-fieldset label="Expires On" :horizontal="false">
              <date-picker class="form-control" :config="dateTimePicker" placeholder="Select date" v-model="date" @change="onChangeDate"></date-picker>
              <b-form-checkbox v-model="token.expires" @change="onChangeExpiryDate">Non Expiring Token</b-form-checkbox>
            </b-form-fieldset>
          </div>

        </div>

        <div class="col-md-6">
          <b-form-fieldset label="Status" :horizontal="false">
            <b-form-checkbox v-model="token.enabled">enabled</b-form-checkbox>
          </b-form-fieldset>
        </div>
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

    <b-card v-if="permissions.length > 0">
      <div class="row">
        <div class="col-md-6">
          <b-form-fieldset label="Permissions" :horizontal="false">
            <div v-for="p in permissions">
              <input type="checkbox" v-model="selectedPermission" v-bind:id="p" v-bind:value="p"><label v-bind:for="p">{{p}}</label><br/>
            </div>
          </b-form-fieldset>
        </div>
      </div>
      <!--/.row-->

      <div class="row">
        <div class="col-md-12">
          <div slot="footer">
            <b-button type="submit" size="sm" variant="primary" class="float-right" @click="SavePermissions">
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
  </div>
</template>

<script>
  import datePicker from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';

  export default {
    name: 'token_form',
    data() {
      return {
        loading: false,
        error: false,
        // ...defaultData()
        date: null,
        token: {
          name: null,
          token: null,
          deviceId: null,
          secret: null,
          enabled: false,
          expires: null,
          owner: null
        },
        dateTimePicker: {
          enableTime: true,
          altInput: true,
          defaultDate: new Date(),
          minDate: 'today'
        },
        selectedPermission: [],
        permissions: []
      }
    },
    components: {
      datePicker
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
        this.$raptor.Admin().Token().load(tokenId)
        .then((token) => {
          this.$log.debug('Token %s loaded', tokenId)
          this.loading = false
          this.token = token
          console.log("===========")
          console.log(JSON.stringify(token))
          console.log(this.token)
          this.token.owner = token.owner
          let tokenExpiresDate = new Date()
          this.date = tokenExpiresDate.setMilliseconds(tokenExpiresDate.getMilliseconds() + token.expires)
          this.loadPermissions(token)
        })
        .catch((e) => {
          this.$log.debug('Failed to load token')
          this.$log.error(e)
          this.loading = false
          console.log(e)
        })
      },
      loadPermissions (tok) {
        this.$raptor.Admin().Token().Permission().get(tok)
        .then((permission) => {
          console.log('permission %s loaded', permission)
          console.log(JSON.stringify(permission))
          if(permission) {
            this.selectedPermission = permission
          }
          console.log(permission)
          this.permissions = ['admin','list','read','update','create','delete','push','pull','execute','data','tree']
        })
        .catch((e) => {
          this.$log.debug('Failed to load permission')
          this.$log.error(e)
          this.loading = false
        })
      },
      cancel() {
        this.$router.push("/admin/tokens")
      },
      save() {
        let today = new Date()
        let selectedDate = (new Date(this.date))
        console.log("selected date: " + this.date + " sec: " + (new Date(this.date)).getTime() + " today: " + today)
        this.token.expires = Math.abs((selectedDate.getTime() - today.getTime()));
        console.log(this.token.expires)
        this.$log.debug('Saving token', this.token)
        this.$raptor.Admin().Token().save(this.token)
        .then((tok) => {
          this.$log.debug('Token %s saved', tok.id)
          this.loading = false
          this.loadPermissions(tok)
          this.token = tok
          console.log("===========")
          console.log(tok)
          this.token.owner = tok.owner
          this.loadPermissions(tok)
          // this.$router.push("/admin/tokens")
        })
        .catch((e) => {
          this.$log.debug('Failed to save token')
          this.$log.error(e)
          this.loading = false
        })
      },
      SavePermissions() {
        console.log("========================================")
        console.log(this.token)
        console.log(this.selectedPermission)
        this.$raptor.Admin().Token().Permission().set(this.token,this.selectedPermission)
        .then((p) => {
          this.$log.debug('Permissions saved')
          this.$router.push("/admin/tokens")
        })
        .catch((e) => {
          this.$log.debug('Failed to save token')
          this.$log.error(e)
          this.loading = false
        })
      },
      onChangeExpiryDate(event) {
        console.log(event)
        if(this.token.expires) {
          this.date = 0;
        }
      },
      onChangeDate(event) {
        console.log(event)
        this.token.expires = false;
      },
    }
  }
</script>
