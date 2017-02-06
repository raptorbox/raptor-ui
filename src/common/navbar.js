
import {inject} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {ClientService} from '../client';

@inject(ClientService, AppRouter)
export class Navbar {
  user = {
    name: ''
  };
  constructor(client, router) {
    this.client = client;
    this.router = router;
  }
  activate() {
    this.user = this.client.auth().currentUser();
  }
  logout() {
    this.client.logout().complete(() => this.router.redirect('/'));
  }
  toggleSidebar() {
    $('body').toggleClass('sidebar-nav');
  }
  toggleAside() {
    $('body').toggleClass('aside-menu-open');
  }
}
