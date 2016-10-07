import { Component, Output, ViewChild, EventEmitter } from '@angular/core';

import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { Category } from './category';
import { TransactionService } from './transaction.service';

@Component({
  moduleId: module.id,
  selector: 'category-create',
  templateUrl: 'category-create.component.html',
})
export class CategoryCreateComponent {
    @Output()
    onSave: EventEmitter<any> = new EventEmitter();

    @ViewChild('newcatmodal') public childModal:ModalDirective;

    private category: Category = new Category();

    constructor(private transactionService: TransactionService) {

    }

    show() {
        this.childModal.show();
    }

    hide(): void {
        this.childModal.hide();
    }

    save() {
        this.transactionService.createCategory(this.category).then(
            cat => {
                this.reset();
                this.hide();
                this.onSave.emit();
            }
        );
    }

    reset() {
        this.category = new Category();
    }
}
