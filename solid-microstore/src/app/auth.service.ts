import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getWebId() {
    return 'https://tdupont-td.solidcommunity.net/profile/card#me';
  }
}
