export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
      badge: {
        variant: 'primary'
        // text: 'NEW'
      }
    },
    {
      title: true,
      name: 'Admin'
    },
    {
      name: 'Admin',
      url: '/admin',
      icon: 'icon-calculator',
      children: [
        {
          name: 'Users',
          url: '/admin/users',
          icon: 'icon-user'
        },
        {
          name: 'Tokens',
          url: '/admin/tokens',
          icon: 'icon-puzzle'
        }
      ]
    },
    {
      title: true,
      name: 'Inventory'
    },
    {
      name: 'Devices',
      url: '/inventory',
      icon: 'icon-screen-smartphone',
      children: [
        {
          name: 'List',
          url: '/inventory/list',
          icon: 'icon-list'
        },
        {
          name: 'Search',
          url: '/inventory/search',
          icon: 'icon-magnifier'
        }
      ]
    }
  ]
}
