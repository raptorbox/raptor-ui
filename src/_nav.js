export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
      badge: {
        variant: 'primary',
        text: 'NEW'
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
          icon: 'icon-puzzle'
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
      url: '/inventory/list',
      icon: 'icon-puzzle'
    }
  ]
}
