import { Component } from '@angular/core';
import { AuthService } from './auth-service.service';

@Component({
  selector: 'wmp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Web Monetization Provider';
  navCollapsed = true;

  constructor(public auth: AuthService) {

  }

}
