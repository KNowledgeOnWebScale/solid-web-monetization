import { Component, OnInit } from '@angular/core';
import { GeneratedImage, ImageService } from '../image.service';
import { WmPService } from '../wmp.service';

@Component({
  selector: 'app-mix',
  templateUrl: './mix.component.html',
  styleUrls: ['./mix.component.scss'],
})
export class MixComponent implements OnInit {
  images: GeneratedImage[] = [];

  constructor(private wm: WmPService, private img: ImageService) { }

  ngOnInit(): void {
    for (let i = 0; i < 20; i++) {
      this.images.push(this.img.getRandomImage());  
    }
  }

  isMonetizationAvailable(): boolean {
    return this.wm.isMonetizationSupported();
  }
}
