import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  readonly providers: AuthProviderProps[] = [
    {
      url: 'https://inrupt.net',
      imgUrl: './assets/logos/inrupt.png',
      label: 'inrupt.net'
    },
    {
      url: 'https://solidcommunity.net',
      imgUrl: './assets/logos/solid.svg',
      label: 'solidcommunity.net'
    },
    {
      url: 'http://localhost:3000',
      imgUrl: './assets/logos/solid.svg',
      label: 'Custom Solid Identity Provider',
      custom: true
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}

export interface AuthProviderProps {
  url: string;
  imgUrl: string;
  label?: string;
  custom?: boolean;
}