import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as solidAuth from '@inrupt/solid-client-authn-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'solid-accountant';
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
      // Regular location strategy
      let path = url.substring(url.lastIndexOf('/'));

      // Hash location strategy
      if (url.indexOf('#') > -1) {
        path = url.split('#')[1];
      }
      this.ngZone.run(() => {
        this.router.navigate([path]);
      });
    });
  }

  logout() {
    solidAuth.logout().then(_ => window.location.reload());
  }
}
