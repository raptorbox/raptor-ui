import Vue from 'vue'
import Router from 'vue-router'

// Containers
import Full from '@/containers/Full'

// Views
import Dashboarddef from '@/views/Dashboard'
import Charts from '@/views/Charts'
import Widgets from '@/views/Widgets'

import UsersList from '@/views/user/user_list'
import UsersForm from '@/views/user/user_form'

import TokensList from '@/views/token/token_list'
import TokensForm from '@/views/token/token_form'

import DeviceList from '@/views/device/device_list'
import DeviceForm from '@/views/device/device_form'
import DeviceSearch from '@/views/device/search'
import DeviceDataChart from '@/views/components/realtimechart/realtimechart'

import ChartDetail from '@/views/components/chartDetailPage'
// Streams
import StreamList from '@/views/device/streams/stream_list'

// Device RecordSet
import DeviceRecordSet from '@/views/device/records/records'

// Project
// import Dashboard from '@/views/stats/dashboard'

// Admin
import AdminDashboard from '@/views/admin/dashboard'

// User Dashboard
import UserDashboard from '@/views/userdashboard/dashboard'

// Views - Components
import Buttons from '@/views/components/Buttons'
import SocialButtons from '@/views/components/SocialButtons'
import Cards from '@/views/components/Cards'
import Forms from '@/views/components/Forms'
import Modals from '@/views/components/Modals'
import Switches from '@/views/components/Switches'
import Tables from '@/views/components/Tables'

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
          name: 'Dashboard',
          component: DeviceDataChart
        },
        {
          path: 'dashboard',
          name: 'User Dashboard',
          component: UserDashboard
        },
        {
          path: 'dashboarddef',
          name: 'Dashboard',
          component: Dashboarddef
        },
        {
          path: 'admindashboard',
          name: 'Dashboard',
          component: AdminDashboard
        },
        {
          path: 'charts',
          name: 'Charts',
          component: Charts
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
        // {
        //   path: 'inventory/search',
        //   component: DeviceSearch,
        //   name: 'Search Device',
        //   children: [
        //     {
        //       path: 'chart',
        //       name: 'RealTimeChart',
        //       component: DeviceDataChart
        //     }
        //   ]
        // },
        // {
        //   path: '/inventory/search',
        //   name: 'Search Device',
        //   redirect: '/inventory/search',
        //   component: {
        //     render (c) { return c('router-view') }
        //   },
        //   children: [
        //     {
        //       path: 'search',
        //       component: DeviceSearch,
        //       name: 'Search Device'
        //     },
        //     {
        //       path: ':deviceId/chart',
        //       name: 'RealTimeChart',
        //       component: DeviceDataChart
        //     }
        //   ]
        // },
        {
          path: 'widgets',
          name: 'Widgets',
          component: Widgets
        },
        {
          path: 'tables',
          name: 'Tables',
          component: Tables
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
          path: 'components',
          redirect: '/components/buttons',
          name: 'Components',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'buttons',
              name: 'Buttons',
              component: Buttons
            },
            {
              path: 'social-buttons',
              name: 'Social Buttons',
              component: SocialButtons
            },
            {
              path: 'cards',
              name: 'Cards',
              component: Cards
            },
            {
              path: 'forms',
              name: 'Forms',
              component: Forms
            },
            {
              path: 'modals',
              name: 'Modals',
              component: Modals
            },
            {
              path: 'switches',
              name: 'Switches',
              component: Switches
            },
            {
              path: 'tables',
              name: 'Tables',
              component: Tables
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
                path: ':deviceId/streams',
                component: StreamList,
                name: 'Streams',
                meta: {
                  label: 'Streams'
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
  Vue.log.debug('accessing path %s', to.path)

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
