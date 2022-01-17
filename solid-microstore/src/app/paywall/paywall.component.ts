import { Component, OnDestroy, OnInit } from '@angular/core';
import { MonetizationService } from '../monetization.service';
import * as SockJS from 'sockjs-client';
import { SolidService } from '../solid.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.scss']
})
export class PaywallComponent implements OnInit, OnDestroy {
  wmp: string | undefined;
  isLocked: boolean = true;
  logs: string[] = [];

  private sock: WebSocket | null = null;
  private targetPP: string | null = null;


  constructor(
    private money: MonetizationService,
    private auth: AuthService,
    private solid: SolidService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // this.money.setPaymentPointer('$rafiki.money/p/thomas.dupont@ugent.be');
    // this.money.setPaymentPointer('$rafiki.money/p/tdupont@ugent.be');
    // this.money.events.subscribe(console.log)
    // this.sock = new SockJS('http://localhost:8888/ws');

    // this.sock.onopen = function () {
    //   console.log('open');
    //   this.send('test');
    // };

    // this.sock.onmessage = function (e) {
    //   console.log('message', e.data);
    //   this.close();
    // };

    // this.sock.onclose = function () {
    //   console.log('close');
    // };

    this.solid.getWebMonetizationProvider().subscribe(wmp => this.wmp = wmp);
    this.targetPP = this.money.getTargetPaymentPointer();
  }

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }


  unlock() {
    this.isLocked = false;

    // Rest call to WMP to get ID
    const body = JSON.stringify({ targetPaymentPointer: this.targetPP!! })
    const fetch = this.auth.fetch;
    fetch(`${this.wmp}/api/me/sessions`, {
      method: 'POST',
      body
    })
      .then(res => res.json())
      .then(
        res => this.setupWebSocket(res.sessionId),
        err => console.error(err)
      )

    // ID to setup websocket

    // Start outputting messages
  }

  private setupWebSocket(id: string) {
    if (this.sock) {
      this.sock.close();
      this.sock = null;
    }
    this.sock = new SockJS(`${this.wmp}/api/me/sessions/${id}/channel`);
    const logs = this.logs;

    this.sock.onopen = function () {
      logs.push('Opened channel')
    };

    this.sock.onmessage = function (e) {
      logs.push(e.data);
    };

    this.sock.onclose = function () {
      logs.push('Closed channel')
    };
  }

  ngOnDestroy(): void {
      if (this.sock) {
        this.sock.close();
      }
  }
}
