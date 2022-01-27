import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MonetizationPendingEvent, MonetizationProgressEvent, MonetizationStartEvent, MonetizationState, MonetizationStopEvent } from 'types-wm';
import { WmpService } from '../wmp.service';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {
  total: number = 0;
  state: MonetizationState = 'pending';
  currency = ''


  @ViewChild('outer') 
  outer: ElementRef<HTMLDivElement>|undefined;

  constructor() { }

  ngOnInit(): void {
    if (document.monetization) {
      document.monetization.addEventListener('monetizationstart', e => this.onStart(e));
      document.monetization.addEventListener('monetizationprogress', e => this.onProgress(e));
      document.monetization.addEventListener('monetizationstop', e => this.onStop(e));
      document.monetization.addEventListener('monetizationpending', e => this.onPending(e));
    }
  }

  private onStart(evt: MonetizationStartEvent) {
    this.state = 'started';
  }
  private onProgress(evt: MonetizationProgressEvent) {
    this.state = 'started';
    const detail = evt.detail;
    const el = this.outer!!.nativeElement;
    el.classList.add('blink');
    setTimeout(() => {
      el.classList.remove('blink');
    }, 400);
    this.total += parseInt(detail.amount);
    if (this.currency != detail.assetCode) {
      this.currency = detail.assetCode;
    }
  }
  private onStop(evt: MonetizationStopEvent) {
    this.state = 'stopped';
    this.total = 0;
  }
  private onPending(evt: MonetizationPendingEvent) {
    this.state = 'pending';
    
  }

}
