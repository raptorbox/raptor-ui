<template>
<div class="app flex-row align-items-center">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card-group mb-0">
          <div class="card p-4">
            <div class="card-body" @keydown.enter="login()">
              <h1>Login</h1>
              <p class="text-muted">Sign In to your account</p>
              <div class="input-group mb-3">
                <span class="input-group-addon"><i class="icon-user"></i></span>
                <input type="text" class="form-control" placeholder="Username" v-model="username">
              </div>
              <div class="input-group mb-4">
                <span class="input-group-addon"><i class="icon-lock"></i></span>
                <input type="password" class="form-control" placeholder="Password" v-model="password">
              </div>
              <div class="row">
                <div class="col-6">
                  <button type="button" class="btn btn-primary px-4" v-on:click="login">Login</button>
                </div>
                <!-- <div class="col-6 text-right">
                    <button type="button" class="btn btn-link px-0">Forgot password?</button>
                  </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <b-modal title="Select Application" class="modal-info" v-model="selectAppModal" @ok="loadSelectedApplication">
      <div>
        <b-form-group label="Applications">
          <b-form-radio-group stacked v-model="selectedApp" :options="appOptions" name="applications">
          </b-form-radio-group>
        </b-form-group>

      </div>
    </b-modal>
</div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      selectedApp: null,
      appOptions: [],
      selectAppModal: false
    }
  },
  created () {
    const cfg = this.$raptor.getConfig()
    this.username = cfg.username
    this.password = cfg.password
  },
  methods: {
    login: function (ev) {
      let cfg = {
        username: this.username,
        password: this.password
      }
      if(this.selectedApp) {
        cfg.domain = this.selectedApp
      }
      this.$raptor.Auth().login(cfg)
        .then((user) => {
          this.$log.info('Welcome %s', this.$raptor.Auth().getUser().username)

          // if(this.selectedApp) {
          //   console.log(require("util").inspect(this.$raptor))
            this.load()
          // } else {
          //   this.loadApplications(user.id)
          // }
        })
        .catch((e) => {
          this.$log.error('Login failed: %s', e.message)
          alert(`Error: ${e.message}`)
        })
    },
    loadApplications(userId) {
      this.$log.debug('Fetching app list')
      // page config
      let page = {
        page: 0,
        size: 50
      }
      // this.$log.debug(page)
      this.$raptor.App().list(page).then((pager) => {

        this.selectAppModal = true

        this.$log.debug('Loaded %s app list', pager.getContent().length)

        this.loading = false
        this.pager = pager
        let list = pager.getContent()
        list.forEach((a) => {
          let app = { value: a.id , text: a.name}
          this.appOptions.push(app)
        })
        if(list.length == 0) {
          this.load()
        }
      }).catch(function(e) {
        context.$log.warn(e)
        if (e.code === 401) {
          context.$raptor.Auth().logout();
          context.$router.push("/pages/login");
          return
        }
        this.load()
      })
    },
    loadSelectedApplication() {
      this.login()
    },
    load() {
      localStorage.raptor = JSON.stringify({
        token: this.$raptor.Auth().getToken()
      })

      let path = '/'
      let parts = document.location.hash.split('?')
      if (parts.length === 2) {
        path = decodeURIComponent(parts[1].replace(/^redirect=/, ''))
      }

      this.$log.debug('Redirecting to %s', path)
      this.$router.push(path)
    }
  }
}
</script>
