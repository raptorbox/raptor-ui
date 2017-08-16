<template>
  <div class="animated fadeIn">

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

              <tr>
                <td>Yiorgos Avraamu</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
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
      </div><!--/.col-->
    </div><!--/.row-->

  </div>

</template>

<script>
export default {
  name: 'user_list'
}
</script>
