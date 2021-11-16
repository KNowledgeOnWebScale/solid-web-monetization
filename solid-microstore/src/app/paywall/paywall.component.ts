import { Component, OnInit } from '@angular/core';
import { MonetizationService } from '../monetization.service';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.scss']
})
export class PaywallComponent implements OnInit {

  constructor(private money: MonetizationService) { }

  ngOnInit(): void {
    // this.money.setPaymentPointer('$rafiki.money/p/thomas.dupont@ugent.be');
    // this.money.setPaymentPointer('$rafiki.money/p/tdupont@ugent.be');
    this.money.events.subscribe(console.log)
  }

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }

}