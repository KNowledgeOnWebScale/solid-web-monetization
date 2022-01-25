import { Component, InjectionToken, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { BrowserStorageService } from '../browser-storage.service';

@Component({
  selector: 'wmp-call-back',
  templateUrl: './call-back.component.html',
  styleUrls: ['./call-back.component.scss']
})
export class CallBackComponent implements OnInit {

  constructor(route: ActivatedRoute, router: Router, private storage: BrowserStorageService) {
    route.queryParamMap.pipe(
      map(params => [params.get('at'), params.get('it')] as [string,string]),
      map(tokens => this.storeTokens(tokens)),
    ).subscribe(_ => router.navigate(['']));
  }

  ngOnInit(): void {
  }

  private storeTokens(tokens: [string,string] | null) {
    if (tokens) {
      this.storage.set("at", tokens[0]);
      this.storage.set("it", tokens[1]);
    }    else {
      this.storage.remove("at");
      this.storage.remove("it");
    }
  }

}
