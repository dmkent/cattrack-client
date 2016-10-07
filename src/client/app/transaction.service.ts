import { Injectable } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/toPromise';

import { Transaction, TransactionPage } from './transaction';
import { Category, CategorySummary } from './category';
import { Account } from './account';
import { Period } from './period';
import { Bill, RecurringPayment } from './bill';
import { Config } from './shared/index';


function tpFromResponse(response: Response): TransactionPage {
    let decoded = response.json();
    let tp = new TransactionPage();
    tp.count = decoded.count;
    tp.transactions = decoded.results as Transaction[];
    return tp;
}


function parseJwt (token: string) {
    let base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

@Injectable()
export class TransactionService {
    private api_url = Config.API;
    private loginUrl = this.api_url + 'api-token-auth/';
    private refreshLoginUrl = this.api_url + 'api-token-refresh/';
    private transUrl = `${this.api_url}api/transactions/`;
    private catUrl = `${this.api_url}api/categories/`;
    private accountUrl = `${this.api_url}api/accounts/`;
    private periodUrl = `${this.api_url}api/periods/`;
    private billUrl = `${this.api_url}api/bills/`;
    private paymentUrl = `${this.api_url}api/payments/`;

    private authToken: string = null;
    private authExpires: Date = null;
    private headers = new Headers({
        'Content-Type': 'application/json',
    });

    constructor(private http: Http,
                private router: Router) {
        this._updateAuth();
    }

    _updateAuth(token?: string) {
        if (token === undefined) {
            token = localStorage.getItem('auth_token');
        }

        if (token) {
            let payload = parseJwt(token);
            this.authExpires = new Date(payload.exp * 1000);
            console.log('Expires:' + this.authExpires.toString());
            if (this.authExpires <= new Date()) {
                this._clearAuth();
                return false;
            }
            this.authToken = token;
            this.headers.set('Authorization', 'JWT ' + this.authToken);
            return true;
        }
        return false;
    }

    _clearAuth() {
        this.authExpires = null;
        this.authToken = null;
        this.headers.delete('Authorization');
    }

    login(details: any) {
        let headers = new Headers({
            'Content-Type': 'application/json',
        });
        let args = new URLSearchParams();
        args.set('format', 'json');
        return this.http.post(this.loginUrl,
                              JSON.stringify(details), {headers: headers, search: args})
                   .toPromise()
                   .then(res => {
                       let token = res.json().token;
                       this._updateAuth(token);
                   })
                   .catch(this.handleError);
    }

    logout() {
        this._clearAuth();
    }

    refreshLogin(): Promise<any> {
        let now = new Date();
        // 1. check if we are expired - clear auth
        if (now > this.authExpires) {
            this._clearAuth();
            return new Promise((resolve, reject) => reject('Expired'));
        }

        // 2. check if more than 5 mins until expire - don't refresh
        if ((this.authExpires.getTime() - now.getTime()) > 300000 ) {
            return new Promise((resolve, reject) => resolve('Already valid'));
        }

        // 3. not expired, but near expiry - refresh
        let headers = new Headers({
            'Content-Type': 'application/json',
        });
        let args = new URLSearchParams();
        args.set('format', 'json');
        return this.http.post(this.refreshLoginUrl,
                              JSON.stringify({token: this.authToken}),
                              {headers: headers, search: args})
                   .toPromise()
                   .then(res => {
                       let token = res.json().token;
                       this._updateAuth(token);
                   })
                   .catch(res => this.router.navigate(['/login']));
    }

    isLoggedIn() {
        console.log(this.authExpires);
        console.log(new Date());
        return (this.authToken !== null &&
                this.authExpires > new Date());
    }

    defaultGetHeaders() {
        let args = new URLSearchParams();
        args.set('format', 'json');
        return args;
    }

    /*
     *
     * Transaction API
     *
     */
    getTransactions(page: number, page_size: number = 10,
                    category: Category = null,
                    account: Account = null,
                    from_date: Date = null,
                    to_date: Date = null): Promise<TransactionPage> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        args.set('page', '' + page);
        args.set('page_size', '' + page_size);

        if (category !== null) {
            args.set('category', '' + category.id);
        }
        if (account !== null) {
            args.set('account', '' + account.id);
        }
        if (from_date !== null) {
            args.set('from_date', from_date.toString());
        }
        if (to_date !== null) {
            args.set('to_date', to_date.toString());
        }
        return this.http.get(this.transUrl, {search: args, headers: this.headers})
                   .toPromise()
                   .then(tpFromResponse)
                   .catch(this.handleError);
    }

    getTransactionsSummary(category: Category = null,
                           account: Account = null,
                           from_date: Date = null,
                           to_date: Date = null): Promise<CategorySummary[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();

        if (category !== null) {
            args.set('category', '' + category.id);
        }
        if (account !== null) {
            args.set('account', '' + account.id);
        }
        if (from_date !== null) {
            args.set('from_date', from_date.toString());
        }
        if (to_date !== null) {
            args.set('to_date', to_date.toString());
        }
        return this.http.get(this.transUrl + 'summary/', {search: args, headers: this.headers})
                   .toPromise()
                   .then(res => res.json() as CategorySummary[])
                   .catch(this.handleError);
    }


    getTransaction(id: number): Promise<Transaction> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.transUrl + id + '/', {search: args, headers: this.headers})
                   .toPromise()
                   .then(response => response.json())
                   .catch(this.handleError);
    }

    updateTransaction(transaction: Transaction, splits: any = null): Promise<Transaction> {
        this.refreshLogin();
        const url = `${this.transUrl}${transaction.id}/`;
        const splitsUrl = url + 'split/';

        if (splits !== null && splits.length === 1) {
            let new_category = splits[0].category;
            transaction.category = new_category;
        }
        let first_request = (transaction: Transaction) => {
            return this.http
                .put(url, JSON.stringify(transaction), {headers: this.headers})
                .toPromise()
                .then(() => transaction)
                .catch(this.handleError);
        };
        let second_request = (transaction: Transaction) => {
            return new Promise<Transaction>((resolve, reject) => {
                resolve(transaction);
            });
        };
        if (splits !== null && splits.length > 1) {
            second_request = (transaction: Transaction) => {
                return this.http
                .post(splitsUrl, JSON.stringify(splits), {headers: this.headers})
                .toPromise()
                .then(() => transaction)
                .catch(this.handleError);
            };
        }

        return first_request(transaction)
               .then(() => second_request(transaction));
    }

    categorySuggestions(transaction: Transaction): Promise<Category[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        const url = `${this.transUrl}${transaction.id}/suggest`;
        return this.http.get(url, {search: args, headers: this.headers}).toPromise()
               .then(res => res.json() as Category[])
               .catch(this.handleError);
    }

    createTransaction(trans: Transaction): Promise<Transaction> {
        this.refreshLogin();
        return this.http
            .post(this.transUrl, JSON.stringify(trans),
                  {headers: this.headers})
            .toPromise()
            .then(res => res.json())
            .catch(this.handleError);
    }

    deleteTransaction(trans: Transaction): Promise<void> {
        this.refreshLogin();
        let url = `${this.transUrl}${trans.id}/`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    /*
     *
     * Category API
     *
     */
    getCategories(): Promise<Category[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.catUrl, {search: args, headers: this.headers})
                   .toPromise()
                   .then(res => res.json())
                   .catch(this.handleError);
    }

    createCategory(category: Category): Promise<Category> {
        this.refreshLogin();
        return this.http
            .post(this.catUrl, JSON.stringify(category),
                  {headers: this.headers})
            .toPromise()
            .then(res => res.json() as Category)
            .catch(this.handleError);
    }

    deleteCategory(category: Category): Promise<void> {
        this.refreshLogin();
        let url = `${this.catUrl}${category.id}/`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    /*
     *
     * Accounts API
     *
     */
    getAccounts(): Promise<Account[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.accountUrl, {search: args, headers: this.headers})
                   .toPromise()
                   .then(res => res.json())
                   .catch(this.handleError);
    }

    createAccount(account: Account): Promise<Account> {
        this.refreshLogin();
        return this.http
            .post(this.accountUrl, JSON.stringify(account),
                  {headers: this.headers})
            .toPromise()
            .then(res => res.json() as Account)
            .catch(this.handleError);
    }

    deleteAccount(account: Account): Promise<void> {
        this.refreshLogin();
        let url = `${this.accountUrl}${account.id}/`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    getBills(): Promise<Bill[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.billUrl, {search: args})
                   .toPromise()
                   .then(res => res.json() as Bill[])
                   .catch(this.handleError);
    }

    getRecurringPayments(): Promise<RecurringPayment[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.paymentUrl, {search: args})
                   .toPromise()
                   .then(res => res.json() as RecurringPayment[])
                   .catch(this.handleError);
    }

    getRecurringPayment(id: number): Promise<RecurringPayment> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.paymentUrl + id, {search: args})
                   .toPromise()
                   .then(response => response.json())
                   .catch(this.handleError);
    }

    updateRecurringPayment(payment: RecurringPayment): Promise<RecurringPayment> {
        this.refreshLogin();
        return this.http
                .put(this.paymentUrl + payment.id,
                     JSON.stringify(payment), {headers: this.headers})
                .toPromise()
                .then(() => payment)
                .catch(this.handleError);
    }

    getUploadOptions(account: Account): Object {
        this.refreshLogin();
        return {
            url: this.accountUrl +
                 account.id + '/load/',
            customHeaders: {
                'Authorization':  'JWT ' + this.authToken,
            },
            fieldName: 'data_file',
            filterExtensions: true,
            allowedExtensions: ['ofx'],
            autoUpload: false,
        };
    }

    /*
     *
     * Periods API
     *
     */
    getPeriods(): Promise<Period[]> {
        this.refreshLogin();
        let args = this.defaultGetHeaders();
        return this.http.get(this.periodUrl, {search: args, headers: this.headers})
                   .toPromise()
                   .then(res => res.json() as Period[])
                   .catch(this.handleError);
    }

    createPeriod(period: Period): Promise<Period> {
        this.refreshLogin();
        return this.http
            .post(this.periodUrl, JSON.stringify(period),
                  {headers: this.headers})
            .toPromise()
            .then(res => res.json() as Period)
            .catch(this.handleError);
    }

    deletePeriod(period: Period): Promise<void> {
        this.refreshLogin();
        let url = `${this.periodUrl}${period.id}/`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }


    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
