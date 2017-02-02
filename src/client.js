
import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';
import * as Raptor from 'raptor';
import * as Promise from 'bluebird';


let store = {
  auth: {},
  get(key) {
    try {
      this.auth = localStorage.auth ? JSON.parse(localStorage.auth) : {};
    } catch (e) {
      return null;
    }
    return this.auth[key] === undefined ? null : this.auth[key];
  },
  set(key, r) {
    this.auth[key] = r;
    this.save();
  },
  clear(key) {
    this.auth[key] = null;
    this.save();
  },
  save() {
    localStorage.auth = JSON.stringify(this.auth);
  }
};

@inject(Config)
export class ClientService {

  constructor(apiConfig) {
    this.apiConfig = apiConfig;
    this.client = new Raptor({
      url: 'http://api.raptor.local'
    });

    let user = store.get('user');

    console.warn('GOT U', user);
    console.warn('GOT T', store.get('token'));

    if (user) {
      this.client.auth.setUser(user);
      this.client.auth.setToken(store.get('token'));
    }
  }

  api() {
    return this.client;
  }

  auth() {
    return this.client.auth;
  }

  getUser(i) {
    return this.client.getUser(i);
  }

  currentUser() {
    return this.client.auth.currentUser();
  }

  login(i) {
    return this.client.auth.login(i).then(r =>  {
      store.set('user', this.client.auth.currentUser());
      store.set('token', this.client.auth.currentUser().getToken());
      console.warn('SET',
        this.client.auth.currentUser(),
        this.client.auth.currentUser().getToken()
    );
      return Promise.resolve(r);
    });
  }

  logout() {
    store.clear();
    return this.client.auth.logout();
  }

  create(o) {
    return this.client.create(o);
  }

  load(id) {
    return this.client.load(id);
  }

  delete(id) {
    return this.client.delete(id);
  }

}
