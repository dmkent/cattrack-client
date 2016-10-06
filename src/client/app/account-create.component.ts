import { Component, Output, ViewChild, EventEmitter } from '@angular/core';

import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { Account } from './account';
import { TransactionService } from './transaction.service';

@Component({
  moduleId: module.id,
  selector: 'account-create',
  templateUrl: 'account-create.component.html',
})
export class AccountCreateComponent {
    @Output()
    onSave: EventEmitter<any> = new EventEmitter();

    @ViewChild('acctmodal') public childModal:ModalDirective;

    private account: Account = new Account();

    constructor(private transactionService: TransactionService) {

    }

    show() {
        this.childModal.show();
    }

    hide(): void {
      this.childModal.hide();
    }

    save() {
        this.transactionService.createAccount(this.account).then(
            account => {
                this.onSave.emit();
                this.reset();
                this.hide();
            }
        );
    }

    reset() {
        this.account = new Account();
    }
}
