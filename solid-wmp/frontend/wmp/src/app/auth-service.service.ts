import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jose from 'jose';
import { BrowserStorageService } from './browser-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private JWKS = jose.createRemoteJWKSet(new URL('https://solidcommunity.net/jwks'));
  private webId: string | undefined;
  isLoggedIn: boolean|undefined = undefined;


  constructor(private storage: BrowserStorageService, private http: HttpClient) {
  }

  checkIsLoggedIn(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const at = this.storage.get("at");
      let result = false;
      if (at) {
        try {
          // verify signature
          const { payload } = await jose.jwtVerify(at, this.JWKS, { issuer: 'https://solidcommunity.net', audience: 'solid' });
          result = payload != null;
          this.webId = payload.sub;
        } catch (err) {
          console.log(err);
          result = false;
        }
      } else {
        result = false;
      }
      this.isLoggedIn = result;
      resolve();
    });

  }

  logout() {
    // TODO: Could be moved to backend
    const it = this.storage.get('it');
    const cb = encodeURI(document.location.origin);
    this.storage.remove('at');
    this.storage.remove('it');
    document.location.href = `/auth/logout?cb=${cb}&it=${it}`;
  }

  login() {
    document.location.href = '/auth/login?cb=' + encodeURI(document.location.origin + '/cb');
  }

  getWebId() {
    return this.webId;
  }

  getAccessToken() {
    return this.storage.get('at');
  }

  getIdToken() {
    return this.storage.get('it');
  }
}
