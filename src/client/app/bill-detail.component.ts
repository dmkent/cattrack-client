import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { RecurringPayment } from './bill';
import { TransactionService } from './transaction.service';

@Component({
  moduleId: module.id,
  selector: 'bill-detail',
  templateUrl: 'bill-detail.component.html'
})
export class BillDetailComponent implements OnInit {
    @Input()
    payment: RecurringPayment;

    constructor(
      private transactionService: TransactionService,
      private route: ActivatedRoute) {

    }

    ngOnInit(): void {
      this.route.params.forEach((params: Params) => {
        let id = + params['id'];
        this.transactionService.getRecurringPayment(id)
            .then(payment => this.payment = payment);
      });
    }

    save(): void {
      this.transactionService.updateRecurringPayment(this.payment)
          .then(this.goBack);
    }

    goBack(): void {
      window.history.back();
    }
}
