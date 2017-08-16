<template>
<div class="app flex-row align-items-center">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card-group mb-0">
          <div class="card p-4">
            <div class="card-body">
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
          <!-- <div class="card text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <div class="card-body text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <button type="button" class="btn btn-primary active mt-3">Register Now!</button>
                </div>
              </div>
            </div> -->
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: ''
    }
  },
  created () {
    const cfg = this.$raptor.getConfig()
    this.username = cfg.username
    this.password = cfg.password
  },
  methods: {
    login: function (ev) {
      this.$raptor.Auth().login({
        username: this.username,
        password: this.password
      })
        .then((state) => {
          this.$log.info('Welcome %s', this.username)

          localStorage.raptor = JSON.stringify({
            token: this.$raptor.Auth().getToken(),
            valid: (new Date()).getTime() + (1000 * 60 * 10) // 10min
          })

          let path = '/'
          let parts = document.location.hash.split('?')
          if (parts.length === 2) {
            path = decodeURIComponent(parts[1].replace(/^redirect=/, ''))
          }

          this.$router.push(path)
        })
        .catch((e) => {
          this.$log.error('Login failed: %s', e.message)
          alert(`Error: ${e.message}`)
        })
    }
  }
}
</script>
