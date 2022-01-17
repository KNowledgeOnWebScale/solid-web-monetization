import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { AuthService } from '../auth.service';
import { MonetizationService } from '../monetization.service';
import { SolidService } from '../solid.service';

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
  ) { }

  ngOnInit(): void {
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
