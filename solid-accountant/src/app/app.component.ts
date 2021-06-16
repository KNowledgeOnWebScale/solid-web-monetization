import { UrlResolver } from '@angular/compiler';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as solidAuth from '@inrupt/solid-client-authn-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'solid-ng-accountant';
  loggedIn: boolean = false;

  constructor(private router: Router, private ngZone: NgZone) {

  }

  ngOnInit() {
    solidAuth.handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(_ => {
      this.loggedIn = solidAuth.getDefaultSession().info.isLoggedIn;
    });

    solidAuth.onSessionRestore(url => {
      const path = new URL(url).pathname;
      this.ngZone.run(() => {
        this.router.navigate([path]);
      });
    });
  }

  logout() {
    solidAuth.logout().then(_ => window.location.href=window.location.origin);
  }
}
