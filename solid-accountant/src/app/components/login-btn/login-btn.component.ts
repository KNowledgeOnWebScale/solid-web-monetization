import { Component, Input, OnInit } from '@angular/core';
import { AuthProviderProps } from 'src/app/auth/auth.component';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
// import {  } from '@inrupt/solid-client';

@Component({
  selector: 'app-login-btn',
  templateUrl: './login-btn.component.html',
  styleUrls: ['./login-btn.component.scss']
})
export class LoginBtnComponent implements OnInit {
  @Input() provider: AuthProviderProps;

  constructor() { }

  ngOnInit(): void {

  }

  login() {
    solidAuth.login({oidcIssuer: this.provider.url, redirectUrl: window.location.origin});
  }

}