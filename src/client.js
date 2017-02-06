
import {inject} from 'aurelia-framework';
import {Config} from 'aurelia-api';
import {Router} from 'aurelia-router';
import * as Raptor from 'raptor';
import * as Promise from 'bluebird';

import * as debug from 'debug';

const dbg = debug('raptor:ui:client');

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

@inject(Config, Router)
export class ClientService {

  constructor(apiConfig, router) {
    this.apiConfig = apiConfig;
    this.router = router;
    this.client = new Raptor({
      url: 'http://api.raptor.local'
    });

    let user = store.get('user');
    if (user) {
      this.client.auth.setUser(user);
      this.client.auth.setToken(store.get('token'));
      this.watchExpires();
    }

    dbg('Watch events');
    this.client.on('request.error', (e) => {
      dbg('Request error: %j', e);
    });
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
      store.set('token', this.client.auth.currentToken());
      this.watchExpires();
      return Promise.resolve(r);
    });
  }

  logout() {
    return this.client.auth.logout().finally(() => {
      store.clear();
      this.client.auth().clear();
      this.router.navigate('/');
    });
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

  watchExpires() {
    if (this.watching) {
      return;
    }

    let token = store.get('token');

    if (!token) {
      this.logout();
      return;
    }

    let tokenInfo = null;
    try {
      tokenInfo = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      // invalid token
      this.logout();
      return;
    }

    // expires - 30sec
    // ensure the token is still valid
    let expires = (tokenInfo.exp) * 1000;
    let expiring = (tokenInfo.exp - 30) * 1000;

    let lock = false;
    this.watching = setInterval(()=> {
      let now = (new Date()).getTime();
      if (!store.get('token') || now >= expires) {
        this.logout();
        this.clearExpires();
      }
      if (now >= expiring) {
        if (lock) return;
        lock = true;
        this.auth().refreshToken().then(() => {
          store.set('token', this.auth().currentToken());
        })
        .catch((e)=> {
          this.logout();
          this.clearExpires();
        })
        .finally(()=> {
          lock = false;
        });
      }
    }, 1000);
  }

  clearExpires() {
    if (this.watching) {
      clearInterval(this.watching);
      this.watching = null;
    }
  }
}
