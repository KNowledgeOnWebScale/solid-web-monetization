import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService, GeneratedImage, ImageService, SolidService, WmpService } from '../services';

@Component({
  selector: 'app-mix',
  templateUrl: './mix.component.html',
  styleUrls: ['./mix.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MixComponent implements OnInit, OnDestroy {
  images: GeneratedImage[] = [];
  locked: boolean = true;

  constructor(
    private wmp: WmpService,
    private img: ImageService,
    private solid: SolidService,
    private auth: AuthService) {
    if (document.monetization) {
      document.monetization.addEventListener('monetizationstart', _ => this.locked = false);
      document.monetization.addEventListener('monetizationstop', _ => this.locked = true);
    }
  }

  ngOnInit(): void {
    for (let i = 0; i < 100; i++) {
      this.images.push(this.img.getRandomImage());
    }

    // After auth change:
    this.auth.statusChanged$.subscribe(_ => {
      if (this.wmp.isMonetizationSupported()) {
        this.solid.getWebMonetizationProvider().subscribe(wmp => {
          this.wmp.setupWMPayment(wmp);
        })
      };
    });

  }

  ngOnDestroy(): void {
    this.wmp.closeMonetizationStream();
  }

  isMonetizationAvailable(): boolean {
    return this.wmp.isMonetizationSupported();
  }

  isMonetizationStarted(): boolean {
    return this.wmp.isMonetizationStarted();
  }
}
