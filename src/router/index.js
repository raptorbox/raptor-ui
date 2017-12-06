import Vue from 'vue'
import Router from 'vue-router'

// Containers
import Full from '@/containers/Full'

// Users
import UsersList from '@/views/user/user_list'
import UsersForm from '@/views/user/user_form'

// Applications
import AppList from '@/views/app/app_list'
import AppForm from '@/views/app/app_form'

import TokensList from '@/views/token/token_list'
import TokensForm from '@/views/token/token_form'

import DeviceList from '@/views/device/device_list'
import DeviceForm from '@/views/device/device_form'
import DeviceSearch from '@/views/device/search'
import DeviceDataChart from '@/views/components/realtimechart/realtimechart'

import ChartDetail from '@/views/components/chartDetailPage'

// Device RecordSet
import DeviceRecordSet from '@/views/device/records/records'

// Project
// import Dashboard from '@/views/stats/dashboard'

// Admin
import AdminDashboard from '@/views/admin/dashboard'

// User Dashboard
import UserDashboard from '@/views/userdashboard/dashboard'

// Views - Icons
import FontAwesome from '@/views/icons/FontAwesome'
import SimpleLineIcons from '@/views/icons/SimpleLineIcons'

// Views - Pages
import Page404 from '@/views/pages/Page404'
import Page500 from '@/views/pages/Page500'
import Login from '@/views/pages/Login'
import Register from '@/views/pages/Register'

Vue.use(Router)

const PATH_LOGIN = '/pages/login'

const router = new Router({
  mode: 'hash',
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: Full,
      children: [
        {
          path: 'dashboardold',
          name: 'DeviceDataChart',
          component: DeviceDataChart
        },
        {
          path: 'dashboard',
          name: 'UserDashboard',
          component: UserDashboard
        },
        {
          path: 'admindashboard',
          name: 'AdminDashboard',
          component: AdminDashboard
        },
        {
          path: 'chartDetail',
          name: 'ChartDetail',
          meta: {
            label: 'Chart Detail View'
          },
          component: ChartDetail,
          props: true
        },
        {
          path: 'admin',
          redirect: '/admin/users',
          name: 'Admin',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'applications',
              name: 'Applications',
              redirect: '/admin/applications/list',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'list',
                  name: 'List',
                  meta: {
                    label: 'List'
                  },
                  component: AppList
                },
                {
                  path: 'create',
                  name: 'AppCreate',
                  meta: {
                    label: 'Create'
                  },
                  component: AppForm,
                  props: true
                },
                {
                  path: ':applicationId',
                  component: AppForm,
                  name: 'ApplicationUpdate',
                  meta: {
                    label: 'Update'
                  },
                  props: true
                }
              ]
            },
            {
              path: 'users',
              name: 'Users',
              redirect: '/admin/users/list',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'list',
                  name: 'UsersList',
                  meta: {
                    label: 'List'
                  },
                  component: UsersList
                },
                {
                  path: 'create',
                  name: 'UsersCreate',
                  meta: {
                    label: 'Create'
                  },
                  component: UsersForm,
                  props: true
                },
                {
                  path: ':userId',
                  component: UsersForm,
                  name: 'UsersUpdate',
                  meta: {
                    label: 'Update'
                  },
                  props: true
                }
              ]
            },
            {
              path: 'tokens',
              name: 'Tokens',
              redirect: '/admin/tokens/list',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'list',
                  name: 'TokensList',
                  meta: {
                    label: 'List'
                  },
                  component: TokensList
                },
                {
                  path: 'create',
                  name: 'TokensCreate',
                  meta: {
                    label: 'Create'
                  },
                  component: TokensForm
                },
                {
                  path: ':tokenId',
                  component: TokensForm,
                  name: 'TokensUpdate',
                  meta: {
                    label: 'Update'
                  },
                  props: true
                }
              ]
            }
          ]
        },
        {
          path: 'inventory',
          name: 'Inventory',
          redirect: '/inventory/list',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: '',
              name: 'Devices',
              redirect: '/inventory/search',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'search',
                  component: DeviceSearch,
                  name: 'Search'
                },
                {
                  path: ':deviceId/chart',
                  name: 'RealTimeChart',
                  component: DeviceDataChart
                }
              ]
            },
            {
              path: '',
              name: 'Device',
              redirect: '/inventory/list',
              component: {
                render (c) { return c('router-view') }
              },
              children: [{
                path: 'list',
                name: 'DeviceList',
                meta: {
                  label: 'List'
                },
                component: DeviceList
              },
              {
                path: 'create',
                name: 'DeviceCreate',
                meta: {
                  label: 'Create'
                },
                component: DeviceForm,
                props: true
              },
              {
                path: ':deviceId',
                component: DeviceForm,
                name: 'DeviceUpdate',
                meta: {
                  label: 'Update'
                },
                props: true
              },
              {
                path: ':deviceId/clone',
                component: DeviceForm,
                name: 'Clone',
                meta: {
                  label: 'Create device'
                },
                props: true
              },
              {
                path: ':deviceId/data',
                component: DeviceRecordSet,
                name: 'RecordSet',
                meta: {
                  label: 'Records'
                },
                props: true
              }]
            }
          ]
        },
        {
          path: 'icons',
          redirect: '/icons/font-awesome',
          name: 'Icons',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'font-awesome',
              name: 'Font Awesome',
              component: FontAwesome
            },
            {
              path: 'simple-line-icons',
              name: 'Simple Line Icons',
              component: SimpleLineIcons
            }
          ]
        }
      ]
    },

    {
      path: '/pages',
      redirect: '/pages',
      name: 'Pages',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: '404',
          name: 'Page404',
          component: Page404
        },
        {
          path: '500',
          name: 'Page500',
          component: Page500
        },
        {
          path: 'login',
          name: 'Login',
          component: Login
        },
        {
          path: 'register',
          name: 'Register',
          component: Register
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // Vue.log.debug('Accessing path %s', to.path)

  if (to.path === PATH_LOGIN) {
    Vue.log.debug('skip %s', PATH_LOGIN)
    return next()
  }

  Vue.log.debug('Checking login')

  Vue.raptor.Auth().login()
    .then((u) => {
      Vue.log.debug('Login ok')
      next()
    })
    .catch((e) => {
      Vue.log.debug('Login failed: %s', e.message)

      localStorage.raptor = '{}'
      next({
        path: PATH_LOGIN,
        query: {
          redirect: to.fullPath
        }
      })
    })
})

export default router
