import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { Ng2PaginationModule } from 'ng2-pagination';
import 'jquery';
import 'bootstrap';
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import { NgFileSelectDirective } from 'ng2-uploader';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { LoggedInGuard } from './logged-in.guard';
import { TransactionDetailComponent } from './transaction-detail.component';
import { TransactionComponent } from './transaction.component';
import { TransactionService } from './transaction.service';
import { DashboardComponent } from './dashboard.component';
import { CategoriserComponent } from './categoriser.component';
import { AccountComponent } from './accounts.component';
import { AccountDetailComponent } from './account-detail.component';
import { AccountCreateComponent } from './account-create.component';
import { CategoryCreateComponent } from './category-create.component';

@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    routing,
    Ng2BootstrapModule,
    Ng2PaginationModule,
    ModalModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    TransactionDetailComponent,
    TransactionComponent,
    DashboardComponent,
    CategoriserComponent,
    AccountComponent,
    AccountDetailComponent,
    AccountCreateComponent,
    CategoryCreateComponent,
    NgFileSelectDirective
  ],
  providers: [
    TransactionService,
    LoggedInGuard
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
