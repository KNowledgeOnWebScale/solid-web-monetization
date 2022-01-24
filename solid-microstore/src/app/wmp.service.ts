import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import { Monetization, MonetizationState } from 'types-wm';
import { v4 as uuidv4 } from "uuid";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WmPService {
  private wm: Monetization;
  private socket: WebSocket | null = null;
  paymentPointer: string | null = null;
  monetizationId: string | null = null;

  constructor(
    private auth: AuthService
  ) {
    // Test WM capability
    if (!document.monetization) {
      throw new Error('No web monetization support in browser!')
    }
    this.wm = document.monetization;

    // Detect tags
    this.startDetection();
  }

  /**
   * Instruct WMP to initiate a payment
   * @param wmpUrl 
   */
  setupWMPayment(wmpUrl: string) {
    if (this.wm.state != 'pending') {
      throw new Error('Monetization not supported! No meta[name="monetization"] tag found!')
    }
    // Get request Id
    const body = JSON.stringify({ targetPaymentPointer: this.paymentPointer })
    const method = 'POST';
    const fetch = this.auth.fetch;
    fetch(`${wmpUrl}/api/me/sessions`, { method, body })
      .then(res => res.json())
      .then(
        res => setupWebSocket(res.sessionId),
        err => console.error(err)
      )

    const setupWebSocket = (id: string) => {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      this.socket = new SockJS(`${wmpUrl}/api/me/sessions/${id}/channel`);
      this.socket.onopen = evt => this.wmStart(evt);
      this.socket.onmessage = evt => this.wmProgress(evt);
      this.socket.onclose = evt => this.wmStop(false)
    }
  }

  /**
   * Close the current monetization stream.
   */
  closeMonetizationStream(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  /**
   * Is Web Monetization supported (document.monetization != undefined)
   */
  isMonetizationSupported(): boolean {
    return !!this.wm;
  }

  isMonetizationStarted(): boolean {
    return this.wm.state == 'started';
  }

  /**
   * Start listening for changes on the meta[name=monetization] in the head section
   */
  private listenForMetaTagChanges() {
    const observerHead = new MutationObserver(list => {
      list.forEach(record => {
        if (record.addedNodes.length > 0) {
          record.addedNodes.forEach(node => {
            const el = node as HTMLElement;
            if (el.getAttribute('name') == 'monetization' && el.getAttribute('content') != this.paymentPointer) {
              this.setPaymentPointer(el.getAttribute('content')!!);
              // add observer on meta tag for attribute changes
              observerMeta.observe(el, { attributes: true, childList: false, subtree: false });
            }
          });
        }
        if (record.removedNodes.length > 0) {
          record.removedNodes.forEach(node => {
            const el = node as HTMLElement;
            if (el.getAttribute('name') == 'monetization' && el.getAttribute('content') == this.paymentPointer) {
              this.resetPaymentPointer();
              // disconnect existing observer for meta tag
              observerMeta.disconnect();
            }
          });
        }
      });
    });

    const observerMeta = new MutationObserver(list => {
      list.forEach(record => {
        if (record.type == 'attributes' && record.attributeName == 'content') {
          const el = record.target as HTMLElement;
          this.setPaymentPointer(el.getAttribute('content')!!);
        }
      });
    });

    observerHead.observe(document.head, { attributes: false, childList: true, subtree: false })

    // If meta tag present: add observer for meta tag
    const targetNode = document.querySelector("meta[name='monetization']");
    if (targetNode) {
      observerMeta.observe(targetNode, { attributes: true, childList: false, subtree: false });
    }
  }

  /**
    * Sets a new payment pointer string and generates a unique (uuid v4) monetizationId.
    * @param pointer The new payment pointer string
    */
  private setPaymentPointer(pointer: string) {
    if (pointer != this.paymentPointer) {
      if (this.wm.state == 'started') {
        this.wmStop(true);
      }
      this.paymentPointer = pointer;
      this.monetizationId = uuidv4();
      this.wmPending();
    }
  }

  private resetPaymentPointer() {
    if (this.paymentPointer != null) {
      this.wmStop(true);
      this.paymentPointer = null;
      this.monetizationId = null;
    }
  }

  /**
   * Search for static meta tag.
   * @returns True if found, false otherwise
   */
  private searchStaticMetaTag(): boolean {
    let metas = document.getElementsByTagName('meta');
    let meta = metas.namedItem('monetization');
    if (meta && meta.content) {
      this.setPaymentPointer(meta.content);
      return true;
    }
    return false;
  }

  /**
   * Start detecting meta tags
   */
  private startDetection() {
    const found = this.searchStaticMetaTag();

    // Not found, means WM is detected, but no tag found yet
    if (!found) { this.wmDetected(); }

    // Keep searching for meta tag changes
    this.listenForMetaTagChanges();
  }

  /**
   * Monetization meta tag found, no payments sent yet
   */
  private wmPending() {
    this.wm.state = 'pending';
    this.wm.dispatchEvent(new CustomEvent('monetizationpending', {
      detail: {
        paymentPointer: this.paymentPointer,
        requestId: this.monetizationId
      }
    }));
  }

  /**
   * Monetization capability is detected, no tag present yet.
   */
  private wmDetected() {
    this.wm.state = 'stopped';
  }

  /**
   * Monetization started, first payment sent.
   * @param evt 
   */
  private wmStart(evt?: any) {
    this.wm.state = 'started';
    this.wm.dispatchEvent(new CustomEvent('monetizationstart', {
      detail: {
        paymentPointer: this.paymentPointer,
        requestId: this.monetizationId,
      }
    }));
  }

  /**
   * Monetization busy, progress report
   * @param evt 
   */
  private wmProgress(evt: MessageEvent) {
    const data = JSON.parse(evt.data);
    this.wm.dispatchEvent(new CustomEvent('monetizationprogress', {
      detail: {
        paymentPointer: this.paymentPointer,
        requestId: this.monetizationId,
        amount: data.amount,
        assetCode: data.assetCode,
        assetScale: data.assetScale
      }
    }));
  }

  /**
   * Monetization stopped.
   * @param finalized True when meta tag was removed or payment pointer changed
   */
  private wmStop(finalized: boolean) {
    this.wm.state = 'stopped';
    this.wm.dispatchEvent(new CustomEvent('monetizationstop', {
      detail: {
        paymentPointer: this.paymentPointer,
        requestId: this.monetizationId,
        finalized
      }
    }))
  }

}