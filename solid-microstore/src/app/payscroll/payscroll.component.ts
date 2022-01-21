import { Component, OnInit } from '@angular/core';
import { WmPService } from '../wm.service';

@Component({
  selector: 'app-payscroll',
  templateUrl: './payscroll.component.html',
  styleUrls: ['./payscroll.component.scss']
})
export class PayscrollComponent implements OnInit {

  constructor(private wm: WmPService) { }

  ngOnInit(): void {
  }
  

  isMonetizationAvailable(): boolean {
    return this.wm.isMonetizationSupported();
  }

}
