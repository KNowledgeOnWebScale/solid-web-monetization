import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn: boolean = false;
  /**
   * Notifies on auth changes (like suddenly being authed)
   */
  statusChanged$ = new ReplaySubject<void>(1);

  constructor(private router: Router, private ngZone: NgZone) { }

  getWebId(): string {
    return solidAuth.getDefaultSession().info.webId!!;
  }

  handleIncomingCallback(): void {
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

    solidAuth.handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(_ => {
      this.loggedIn = solidAuth.getDefaultSession().info.isLoggedIn;
      this.statusChanged$.next();
    });
  
  }

  login() {
    solidAuth.login({oidcIssuer: 'https://solidcommunity.net', redirectUrl: location.href });
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
