import { Component, ViewContainerRef } from '@angular/core';

import { Config } from './shared/index';

@Component({
  selector: 'sd-app',
  template: `
    <nav class="navbar navbar-default">
    <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="">CatTrack</a>
    </div>
    <div class="collapse navbar-collapse" id="navbar-collapse-1">
      <ul class="nav navbar-nav">
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/accounts" routerLinkActive="active">Accounts</a></li>
        <li><a routerLink="/transactions" routerLinkActive="active">Transactions</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li><a routerLink="/login" routerLinkActive="active">Logout</a></li>
      </ul>
    </div>
    </div>
    </nav>
    <div class="container-fluid">
    <h1>{{title}}</h1>
    <router-outlet></router-outlet>
    </div>
    <div>
    <p class="pull-right text-muted"><small>Client version: {{ version }}</small></p>
    </div>
  `
})
export class AppComponent {
  title = 'CatTrack';
  version = Config.VERSION;

  private viewContainerRef: ViewContainerRef;

  public constructor(viewContainerRef:ViewContainerRef) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}
