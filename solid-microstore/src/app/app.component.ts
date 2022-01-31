import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SOLID MicroStore';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.addMetaTag();
    this.auth.handleIncomingCallback();
  }

  private addMetaTag() {
    this.http.get<any>('/assets/config.json').subscribe(config => {
      const meta = this.document.createElement('meta');
      meta.setAttribute('name', 'monetization');
      meta.setAttribute('content', config.paymentPointer);
      this.document.head.appendChild(meta)
    });
  }

}