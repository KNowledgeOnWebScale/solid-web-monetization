import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnyMxRecord, AnyRecordWithTtl } from 'dns';
import { forkJoin } from 'rxjs';
import { MonetizationService } from '../monetization.service';

@Component({
  selector: 'app-faucet',
  templateUrl: './faucet.component.html',
  styleUrls: ['./faucet.component.scss']
})
export class FaucetComponent implements OnInit {
  private username1: string | null = 'user_vghago9s';
  private token1: string | null = 'mycGPhnwLz0Ua';
  private username2: string | null = 'user_11laxph0';
  private token2: string | null = 'mUkql8fBKCI7n';
  private rafikipp: string | null = '$rafiki.money/p/thomas.dupont@ugent.be';


  user1: any = {};
  user2: any = {};

  lines: string[] = [];
  faucetForm: FormGroup;

  constructor(
    private money: MonetizationService,
    private http: HttpClient,
    fb: FormBuilder
  ) {
    this.faucetForm = fb.group({
      username1: [this.username1, Validators.required],
      token1: [this.token1, Validators.required],
      username2: [this.username2, Validators.required],
      token2: [this.token2, Validators.required],
      rafikipp: [this.rafikipp]
    });

  }

  ngOnInit(): void {
    this.lines = [];
  }

  save() {
    if (this.faucetForm.valid) {
      this.user1 = {
        name: this.faucetForm.get('username1')?.value,
        token: this.faucetForm.get('token1')?.value,
        balance: 0
      }
      this.user2 = {
        name: this.faucetForm.get('username2')?.value,
        token: this.faucetForm.get('token2')?.value,
        balance: 0
      }

      this.log('Destination details stored');
      this.getBalances();

    }
  }

  fundUser1() {
    this.addFunds(this.user1);
  }

  fundUser2() {
    this.addFunds(this.user2);
  }

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }

  log(str: string) {
    this.lines.push(str);
  }

  get detailsPresent(): boolean {
    return this.username1 != null
      && this.username2 != null
      && this.token1 != null
      && this.token2 != null;
  }

  transferToUser1() {
    this.transfer(this.user2, this.user1);
  }
  
  transferToUser2() {
    this.transfer(this.user1, this.user2);
  }

  transferToRafiki() {
    const url = `https://hermes-rest.ilpv4.dev/accounts/${this.user1.name}/pay`
    this.http.post<any>(url,
      { amount: 10*Math.pow(10,9), destinationPaymentPointer: this.rafikipp },
      { headers: { Authorization: `Bearer ${this.user1.token}` } }
    ).subscribe(_ => {
      this.getBalances();
    })
  }

  private transfer(from: any, to: any) {
    const url = `https://hermes-rest.ilpv4.dev/accounts/${from.name}/pay`
    this.http.post<any>(url,
      { amount: 10*Math.pow(10,9), destinationPaymentPointer: `$jc.ilpv4.dev/${to.name}` },
      { headers: { Authorization: `Bearer ${from.token}` } }
    ).subscribe(_ => {
      this.getBalances();
    })
  }
  

  private addFunds(user: any) {
    const url = `https://hermes-rest.ilpv4.dev/accounts/${user.name}/money`;
    this.http.post<any>(url, {}, { headers: { Authorization: `Bearer ${user.token}` } }).subscribe(_ => {
      this.getBalances();
    })
  }

  private getBalances() {
    forkJoin([
      this.http.get<any>(`https://hermes-rest.ilpv4.dev/accounts/${this.user1.name}/balance`, { headers: { Authorization: `Bearer ${this.user1.token}` } }),
      this.http.get<any>(`https://hermes-rest.ilpv4.dev/accounts/${this.user2.name}/balance`, { headers: { Authorization: `Bearer ${this.user2.token}` } }),
    ])
      .subscribe(balances => {
        this.user1.balance = balances[0].accountBalance.netBalance / Math.pow(10, balances[0].assetScale) + ' ' + balances[0].assetCode;
        this.user2.balance = balances[1].accountBalance.netBalance / Math.pow(10, balances[1].assetScale) + ' ' + balances[1].assetCode;
      });
  }
}
