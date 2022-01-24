import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../auth.service';
import { GeneratedImage, ImageService } from '../image.service';
import { SolidService } from '../solid.service';
import { WmPService } from '../wmp.service';

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
    private wm: WmPService,
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
      if (this.wm.isMonetizationSupported()) {
        this.solid.getWebMonetizationProvider().subscribe(wmp => {
          this.wm.setupWMPayment(wmp);
        })
      };
    });

  }

  ngOnDestroy(): void {
      this.wm.closeMonetizationStream();
  }

  isMonetizationAvailable(): boolean {
    return this.wm.isMonetizationSupported();
  }

  isMonetizationStarted(): boolean {
    return this.wm.isMonetizationStarted();
  }
}
