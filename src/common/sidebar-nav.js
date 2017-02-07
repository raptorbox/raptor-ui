
import {inject} from 'aurelia-dependency-injection';
import {AppRouter} from 'aurelia-router';

@inject(AppRouter)
export class SidebarNav {
  constructor(router) {
    this.router = router;
  }
}
