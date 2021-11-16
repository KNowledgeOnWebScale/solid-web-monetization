import { Component, OnInit } from '@angular/core';
import { MonetizationService } from '../monetization.service';

@Component({
  selector: 'app-payscroll',
  templateUrl: './payscroll.component.html',
  styleUrls: ['./payscroll.component.scss']
})
export class PayscrollComponent implements OnInit {

  constructor(private money: MonetizationService) { }

  ngOnInit(): void {
  }
  

  isMonetizationAvailable(): boolean {
    return this.money.isAvailable();
  }

}
