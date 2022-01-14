import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Monetization, MonetizationEvent, MonetizationState } from 'types-wm';

@Injectable({
  providedIn: 'root'
})
export class MonetizationService {
  /**
   * An event stream for web monetization events.
   */
  public readonly events: Observable<MonetizationEvent>;

  /**
   * An event stream for web monetization state changes.
   */
  public readonly state: Observable<MonetizationState>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta
  ) {
    if (this.isAvailable()) {
      this.events = merge<any>(
        fromEvent(this.document.monetization as any, 'monetizationpending'),
        fromEvent(this.document.monetization as any, 'monetizationstart'),
        fromEvent(this.document.monetization as any, 'monetizationstop'),
        fromEvent(this.document.monetization as any, 'monetizationprogress')
      );

      this.state = this.events.pipe(
        map((_) => this.document.monetization!.state),
        distinctUntilChanged()
      );
    } else {
      this.events = EMPTY;
      this.state = EMPTY;
    }
  }

  /**
   * Sets the payment pointer on the document.
   * If a falsy value is provided, the old pointer is removed.
   */
  public setPaymentPointer(paymentPointer: string): void {
    if (paymentPointer)
      this.meta.updateTag({ name: 'monetization', content: paymentPointer });
    else this.meta.removeTag('name="monetization"');
  }

  /**
   * Returns true if web monetization is available.
   */
  public isAvailable(): boolean {
    return !!this.document && !!this.document.monetization;
  }

}


