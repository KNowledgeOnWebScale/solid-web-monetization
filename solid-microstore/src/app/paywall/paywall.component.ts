import { Component, OnInit } from '@angular/core';
import { MonetizationService } from '../monetization.service';
import * as SockJS from 'sockjs-client';
import { StreamService } from '../stream.service';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.scss']
})
export class PaywallComponent implements OnInit {
  private sock: WebSocket | null = null;

  constructor(
    private money: MonetizationService,
    private ss: StreamService
    ) { }

  ngOnInit(): void {
    // this.money.setPaymentPointer('$rafiki.money/p/thomas.dupont@ugent.be');
    // this.money.setPaymentPointer('$rafiki.money/p/tdupont@ugent.be');
    this.money.events.subscribe(console.log)
    this.sock = new SockJS('http://localhost:8888/ws');

    this.sock.onopen = function () {
      console.log('open');
      this.send('test');
    };

    this.sock.onmessage = function (e) {
      console.log('message', e.data);
      this.close();
    };

    this.sock.onclose = function () {
      console.log('close');
    };

    this.ss.connect('test.falx', Buffer.from("blargh", "utf-8")).then(conn => {
      const stream1 = conn.createStream();
      stream1.setSendMax(500);
    });

  }

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }

}
