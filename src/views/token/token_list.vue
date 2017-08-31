<template>
<div class="animated fadeIn row row-fluid">
  <div class="col-lg-12">
    <b-card header="<i class='fa fa-align-justify'></i> Users">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Registered</th>
            <th>Roles</th>
            <th>Status</th>
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
  name: 'token_list',
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
      this.$log.debug('Fetching list')
      this.$raptor.Admin().Token().list()
        .then((list) => {
          this.$log.debug('Loaded %s tokens', list.length)

          this.loading = false
          this.list = list
        })
        .catch((e) => {
          this.$log.debug('Failed to load list')
          this.$log.error(e)

          this.error = e.message
          this.list = []
          this.loading = false
        })
    }
  }

}
</script>
