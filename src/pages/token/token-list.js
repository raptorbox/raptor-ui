import {inject, singleton} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';
import {ClientService} from '../../client';

@inject(AppRouter, ClientService)
@singleton()
export class TokenList {
  tokens = [];
  empty = true;
  users = [];
  totalItems = 100;
  pageSize = 10;
  constructor(router, client) {
    this.client = client;
    this.router = router;
  }
  remove(context) {
    if (confirm('Delete this token?')) {
      this.client.auth().tokens.delete(context.token).then(() => {
        this.tokens = this.tokens.filter((token) => token.id !== context.token.id);
      });
    }
  }
  bind() {
    return this.client.auth().tokens.list()
      .then(tokens => {
        this.tokens = tokens.filter(t => t.type !== 'LOGIN');
        this.empty = this.tokens.length === 0;
      });
  }
}
