import { Injectable } from '@angular/core';
import { WmpClient, MonetizationHandler } from 'solid-wmp-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WmpService {
  private wmp: WmpClient;
  private wmHandler: MonetizationHandler;
  private fetch:  (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

  constructor(
    auth: AuthService
  ) {
    this.wmp = new WmpClient();
    this.wmHandler = this.wmp.getMonetizationHandler();    
    this.fetch = auth.fetch;
  }

  /**
   * Instruct WMP to initiate a payment
   * @param wmpUrl 
   */
  setupWMPayment(wmpUrl: string) {
    return this.wmp.setupPayment(wmpUrl, this.fetch);
  }

  /**
   * Close the current monetization stream.
   */
  closeMonetizationStream(): void {
    this.wmp.closeMonetizationStream();
  }

  /**
   * Is Web Monetization supported (document.monetization != undefined)
   */
  isMonetizationSupported(): boolean {
    return this.wmHandler.isMonetizationSupported();
  }

  isMonetizationStarted(): boolean {
    return this.wmHandler.isStarted();
  }
}