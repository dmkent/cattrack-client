import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Account } from './account';
import { TransactionService } from './transaction.service';

@Component({
  moduleId: module.id,
  selector: 'account-list',
  templateUrl: 'accounts.component.html',
})
export class AccountComponent implements OnInit {
    accounts: Account[] = [];
    selectedAccount: Account = null;

    constructor(
        private transactionService: TransactionService,
        private router: Router) {}

    ngOnInit(): void {
        this.getAccounts();
    }

    getAccounts(): void {
        this.transactionService.getAccounts().then(accts => this.accounts = accts);
    }

    selectAccount(account: Account): void {
        this.selectedAccount = account;
    }

    clearAccount() {
        this.selectedAccount = null;
    }

    delete(account: Account): void {
        this.transactionService.deleteAccount(account).then(() => this.getAccounts());
    }
}
