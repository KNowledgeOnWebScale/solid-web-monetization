import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MonetizationPendingEvent, MonetizationProgressEvent, MonetizationStartEvent, MonetizationStopEvent } from 'types-wm';
import { AuthService } from '../auth.service';
import { SolidService } from '../solid.service';
import { WmPService } from '../wmp.service';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.scss']
})
export class PaywallComponent implements OnInit, OnDestroy, AfterViewInit {
  wmp: string | undefined;
  isLocked: boolean = true;
  logs: string[] = [];

  @ViewChild('paywall') paywall: ElementRef<HTMLDivElement> | undefined;

  private isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private sock: WebSocket | null = null;


  constructor(
    private wm: WmPService,
    private solid: SolidService,
    public auth: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    // Setup listeners
    document.monetization?.addEventListener('monetizationpending', evt => this.onPending(evt));
    document.monetization?.addEventListener('monetizationstart', evt => this.onStart(evt));
    document.monetization?.addEventListener('monetizationprogress', evt => this.onProgress(evt));
    document.monetization?.addEventListener('monetizationstop', evt => this.onStop(evt));
  }

  ngOnInit(): void {
    this.solid.getWebMonetizationProvider().subscribe(wmp => this.wmp = wmp);

  }

  ngAfterViewInit(): void {
    this.isHandset$.subscribe(isHandset => {
      if (this.paywall) {
        console.log(`handset: ` +isHandset)
        this.paywall!!.nativeElement.style.left = isHandset ? '0' : '200px';
        this.paywall!!.nativeElement.style.width = isHandset ? '100%' : 'calc(100% - 200px)';
      }
    });
  }

  isMonetizationAvailable(): boolean {
    return this.wm.isMonetizationSupported();
  }


  unlock() {
    this.isLocked = false;
    this.wm.setupWMPayment(this.wmp!!);
  }

  ngOnDestroy(): void {
    this.wm.closeMonetizationStream()
  }

  private onPending(event: MonetizationPendingEvent) {
    // console.log('pending')
  }

  private onStart(event: MonetizationStartEvent) {
    this.logs.push('Opened channel')
  }

  private onProgress(event: MonetizationProgressEvent) {
    const amount = parseFloat(event.detail.amount);
    const scale = event.detail.assetScale;
    const code = event.detail.assetCode;
    this.logs.push(`Payed ${amount * Math.pow(10, scale)} ${code}`);
  }

  private onStop(event: MonetizationStopEvent) {
    if (event.detail.finalized) {
      this.logs.push("Closed channel: meta tag removed or paymentpointer changed")
    } else {
      this.logs.push("Closed channel")
    }
  }



}
