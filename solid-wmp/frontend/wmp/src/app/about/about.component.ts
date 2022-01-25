import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth-service.service';


@Component({
  selector: 'wmp-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
    
  }

  copyAt() {
    this.clipboard.copy(this.auth.getAccessToken() || '<no access token>')
  }

}
