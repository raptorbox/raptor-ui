import {inject, singleton} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {ClientService} from '../../client';

@inject(AppRouter, ClientService)
@singleton()
export class TokenList {

  constructor(router, client) {
    this.client = client;
    this.router = router;
  }

  users = [];
  totalItems = 100;

  pageSize = 10;

  bind() {
    return this.client.auth().tokens.list()
      .then(tokens => {
        this.tokens = tokens.filter(t => t.token !== this.client.auth().currentToken());
      });
  }
}
