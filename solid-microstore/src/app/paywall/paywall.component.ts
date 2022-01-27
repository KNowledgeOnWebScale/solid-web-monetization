import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MonetizationPendingEvent, MonetizationProgressEvent, MonetizationStartEvent, MonetizationStopEvent } from 'types-wm';
import { AuthService } from '../auth.service';
import { SolidService } from '../solid.service';
import { WmpService } from '../wmp.service';

@Component({
  selector: 'app-paywall',
  templateUrl: './paywall.component.html',
  styleUrls: ['./paywall.component.scss']
})
export class PaywallComponent implements OnInit, OnDestroy, AfterViewInit {
  wmpUri: string | undefined;
  isLocked: boolean = true;
  isClicked: boolean = false;
  logs: string[] = [];

  @ViewChild('paywall') paywall: ElementRef<HTMLDivElement> | undefined;

  private isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private sock: WebSocket | null = null;


  constructor(
    private wmp: WmpService,
    private solid: SolidService,
    public auth: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    // Setup listeners
    document.monetization?.addEventListener('monetizationstart', evt => this.onStart(evt));
    document.monetization?.addEventListener('monetizationprogress', evt => this.onProgress(evt));
    document.monetization?.addEventListener('monetizationstop', evt => this.onStop(evt));
    document.monetization?.addEventListener('monetizationpending', evt => this.onPending(evt));
  }

  ngOnInit(): void {
    this.solid.getWebMonetizationProvider().subscribe(wmp => this.wmpUri = wmp);

  }

  ngAfterViewInit(): void {
    this.isHandset$.subscribe(isHandset => {
      if (this.paywall) {
        this.paywall!!.nativeElement.style.left = isHandset ? '0' : '200px';
        this.paywall!!.nativeElement.style.width = isHandset ? '100%' : 'calc(100% - 200px)';
      }
    });
  }

  isMonetizationAvailable(): boolean {
    return this.wmp.isMonetizationSupported();
  }


  unlock() {
    this.isClicked = true;
    if (this.wmp.isMonetizationSupported()) {
      this.solid.getWebMonetizationProvider().subscribe(wmp => {
        this.wmp.setupWMPayment(wmp);
      })
    } else {
      this.isClicked = false;
    }
  }

  ngOnDestroy(): void {
    this.wmp.closeMonetizationStream()
  }

  private onPending(event: MonetizationPendingEvent) {
    this.isLocked = true;
  }

  private onStart(event: MonetizationStartEvent) {
    this.isLocked = false;
  }

  private onProgress(event: MonetizationProgressEvent) {
    this.isLocked = false;
  }

  private onStop(event: MonetizationStopEvent) {
    this.isLocked = true;
  }



}
