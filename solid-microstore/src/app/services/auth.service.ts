import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Is user logged in */
  loggedIn: boolean = false;

  /**
   * Notifies on auth changes (like suddenly being authed)
   */
  statusChanged$ = new ReplaySubject<void>(1);

  constructor(private router: Router, private ngZone: NgZone) { }

  /**
   * Returns the WebID Profile document URI of the authed user.
   * @returns URI of WebID Profile document.
   */
  getWebId(): string {
    return solidAuth.getDefaultSession().info.webId!!;
  }

  /**
   * Utility method to bundle solid auth library calls
   */
  handleIncomingCallback(): void {
    // Restore session (helps with internal routing after auth callback)
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

    // Callback for authentication after which access tokens are in place
    solidAuth.handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(_ => {
      // Set public property
      this.loggedIn = solidAuth.getDefaultSession().info.isLoggedIn;

      // Notify on subject property that authentication is ready.
      this.statusChanged$.next();
    });
  
  }

  /**
   * Call login on auth library to solidcommunity.net
   */
  login() {
    solidAuth.login({oidcIssuer: 'https://solidcommunity.net', redirectUrl: location.href });
  }

  /**
   * Call logout method on auth library.
   */
  logout() {
    solidAuth.logout().then(_ => window.location.reload());
  }

  /**
   * Return the custom fetch method of the auth library.
   * It injects the proper autentiocaion headers
   */
  get fetch(): (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response> {
    return solidAuth.getDefaultSession().fetch;
  }
}
