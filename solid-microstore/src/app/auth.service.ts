import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as solidAuth from '@inrupt/solid-client-authn-browser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn: boolean = false;

  constructor(private router: Router, private ngZone: NgZone) { }

  getWebId(): string {
    return solidAuth.getDefaultSession().info.webId!!;
  }

  handleIncomingCallback(): void {
    solidAuth.handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(_ => {
      console.log(_);
      this.loggedIn = solidAuth.getDefaultSession().info.isLoggedIn;
    });

    solidAuth.onSessionRestore(url => {
      let path = '/';
      if (url.indexOf('#') > -1) {
        path = url.split('#')[1];
      }
      this.ngZone.run(() => {
        this.router.navigate([path]);
      });
    });
  }

  login() {
    solidAuth.login({oidcIssuer: 'https://solidcommunity.net', redirectUrl: window.location.href});
  }

  
  logout() {
    solidAuth.logout().then(_ => window.location.reload());
  }

  getAccessToken(): string {
    return solidAuth.getDefaultSession().info.webId!!;
  }

  get fetch(): (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response> {
    return solidAuth.getDefaultSession().fetch;
  }
}
