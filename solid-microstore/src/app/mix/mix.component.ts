import { Component, OnInit } from '@angular/core';
import { WmPService } from '../wm.service';

@Component({
  selector: 'app-mix',
  templateUrl: './mix.component.html',
  styleUrls: ['./mix.component.scss']
})
export class MixComponent implements OnInit {

  constructor(private wm: WmPService) { }

  ngOnInit(): void {
  }

  isMonetizationAvailable(): boolean {
    return this.wm.isMonetizationSupported();
  }
}
