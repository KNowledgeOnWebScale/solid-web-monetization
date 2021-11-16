import { Component, OnInit } from '@angular/core';
import { MonetizationService } from '../monetization.service';

@Component({
  selector: 'app-mix',
  templateUrl: './mix.component.html',
  styleUrls: ['./mix.component.scss']
})
export class MixComponent implements OnInit {

  constructor(private money: MonetizationService) { }

  ngOnInit(): void {
  }

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }
}
