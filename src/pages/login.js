
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ClientService} from '../client';

@inject(ClientService, Router)
export class Login {
  constructor(clientService, router) {
    this.clientService = clientService;
    this.router = router;
    this.authenticated = clientService.currentUser() !== null;
  }

  username = '';
  password = '';

  login() {
    if (this.authenticated) {
      return true;
    }

    let username = this.username;
    let password = this.password;

    return this.clientService.login({username, password})
      .then((user) => { this.router.navigate('/'); });
  }

  logout() {
  }

  // use authService.logout to delete stored data
  // set expiredRedirect in your settings to automatically redirect
  signup() {
    return this.clientService.Promise.reject();
  }

  forgot() {

  }
}
