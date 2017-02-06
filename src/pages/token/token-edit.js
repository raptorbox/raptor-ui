
import {inject} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {ClientService} from '../../client';


@inject(ClientService, AppRouter)
export class TokenEdit {
  expiresOff = false;
  expiresPrevValue = 0;
  token = {
    name: 'Token',
    expires: 1800,
    token: null,
    secret: '',
    enabled: true,
    userId: null,
    deviceId: null,
    created: new Date(),
    type: 'DEFAULT'
  };
  constructor(client, router) {
    this.client = client;
    this.router = router;
  }
  activate(params, routeConfig) {
    if (params.id) {
      this.client.auth().tokens.load(params.id).then(token => {
        this.token = token;
        this.token.id = this.token.id || params.id;
      });
    }
  }
  save() {
    this.token.userId = this.token.userId || this.client.currentUser().uuid;
    this.client.auth().tokens.save(this.token)
      .then((r)=> {
        this.router.navigate('token');
      })
      .catch((e)=> {
        console.warn(e);
      });
  }
  toggleExpires() {
    this.expiresOff = !this.expiresOff;
    if (this.expiresOff && this.token.expires > 0) {
      this.expiresPrevValue = this.token.expires;
    }
    this.token.expires = this.expiresOff ? 0 : this.expiresPrevValue;
  }
}
