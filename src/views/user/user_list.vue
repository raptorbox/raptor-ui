<template>
<div class="animated fadeIn row row-fluid">
  <div class="col-lg-12">
    <!-- <b-card header="<i class='fa fa-align-justify'></i> Users"> -->
    <b-card>
      <div class="clearfix" style="background-color: #f0f3f5; border-bottom: 1px solid #c2cfd6; padding:5px;">
        <div style="float: left;">
          <p style="text-align: center; font-weight:bold; margin:0;">Users</p>
        </div>
        <div style="float: right;">
          <b-button class="btn btn-primary" :to="{ name: 'UsersCreate'}">Create User</b-button>
        </div>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Registered</th>
            <th>Roles</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row,idx in list">
            <td>
              <b-button class="btn btn-link" :to="{ name: 'UsersUpdate', params: { userId: row.uuid }}">
                  {{row.username}}
              </b-button>
            </td>

            <td>{{formatDate(row.created)}}</td>
            <td>{{row.roles.join(", ")}}</td>
            <td>
              <span v-bind:class="['badge', {
                      'badge-success': row.enabled,
                      'badge-warning': !row.enabled
                  }]">{{row.enabled ? 'Enabled' : 'Disabled'}}</span>
            </td>
            <td>
              <click-confirm>
                <b-button class="btn btn-outline-danger btn-sm" @click="remove(row.uuid)">Delete</b-button>
              </click-confirm>
            </td>
          </tr>

        </tbody>
      </table>
      <ul class="pagination">

        <li class="page-item"><a class="page-link" href="#">Prev</a></li>

        <li class="page-item active">
          <a class="page-link" href="#">1</a>
        </li>

        <li class="page-item"><a class="page-link" href="#">2</a></li>

        <li class="page-item"><a class="page-link" href="#">Next</a></li>
      </ul>
    </b-card>
  </div>
  <!--/.col-->

</div>
<!--/.row-->
</template>

<script>
import moment from 'moment'

export default {
  name: 'user_list',
  data () {
    return {
      loading: false,
      list: null,
      error: null
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    formatDate (d) {
      return moment(new Date(d)).format('MMMM Do YYYY')
    },
    fetchData () {
      this.error = null
      this.loading = true
      this.$log.debug('Fetching user list')
      this.$raptor.Admin().User().list()
        .then((list) => {
          this.$log.debug('Loaded %s user list', list.length)

          this.loading = false
          this.list = list
        })
        .catch((e) => {
          this.$log.debug('Failed to load user list')
          this.$log.error(e)

          this.error = e.message
          this.list = []
          this.loading = false
        })
    },
    remove (userId) {
        this.$log.debug("Deleting %s", userId)
        this.$raptor.Admin().User().delete({ uuid: userId})
          .then(() => {
              this.$log.debug("Deleted %s", userId)
              this.fetchData()
          })
          .catch((e) => {
              this.$log.error("Error deleting %s", userId)
          })
    },
  }

}
</script>
