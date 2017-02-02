
import {inject} from 'aurelia-dependency-injection';
import {TokenService} from './token-service';


@inject(TokenService)
export class TokenEdit {
  token = {};
  constructor(service) {
    this.service = service;
  }

  get title() {
    return this.token.name || 'Token';
  }

  activate(params, routeConfig) {
    this.service.load(params.id).then(token => this.token = token);
  }
  save() {
    this.service.save(this.token);
  }
}
