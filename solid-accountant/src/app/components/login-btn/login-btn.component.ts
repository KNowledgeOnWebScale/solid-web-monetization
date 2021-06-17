import { Component, Input, OnInit } from '@angular/core';
import { AuthProviderProps } from 'src/app/auth/auth.component';
import * as solidAuth from '@inrupt/solid-client-authn-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-btn',
  templateUrl: './login-btn.component.html',
  styleUrls: ['./login-btn.component.scss']
})
export class LoginBtnComponent implements OnInit {
  @Input() provider: AuthProviderProps;
  @Input() custom: boolean = false;

  authForm: FormGroup;

  constructor(fb: FormBuilder) {
    this.authForm = fb.group({
      oidcProvider: ['http://localhost:3000', Validators.required]
    });
   }

  ngOnInit(): void {
    if (this.custom) {
      this.authForm.reset({
        oidcProvider: this.provider.url
      });
    }
  }

  login() {
    solidAuth.login({oidcIssuer: this.provider.url, redirectUrl: window.location.href});
  }

}