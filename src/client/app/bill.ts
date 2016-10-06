export class Bill {
    id: number;
    description: string;
    due_amount: number;
    fixed_amount: number = null;
    var_amount: number = null;
    paying_transactions: number[] = [];
    document: string;
    series: number;
    is_paid: boolean;
}

export class RecurringPayment {
    id: number;
    name: string;
    is_income: boolean;
    bills: Bill[];
}

