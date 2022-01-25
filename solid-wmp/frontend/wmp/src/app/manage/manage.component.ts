import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concatMap, forkJoin, map, switchMap } from 'rxjs';
import { AuthService } from '../auth-service.service';
import { SolidService } from '../solid.service';
import { Mandate, SessionDetails, SubscriptionDetails } from '../types';
import { WmpService } from '../wmp.service';

@Component({
  selector: 'wmp-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  subscription: SubscriptionDetails | null = null;
  mandate: Mandate | null = null;
  sessions: SessionDetails[] | null = null;
  pps: string[] = [];
  subForm: FormGroup
  loading: boolean = true;

  constructor(
    public auth: AuthService,
    private wmp: WmpService,
    private solid: SolidService,
    fb: FormBuilder
  ) {
    this.subForm = fb.group({
      pp: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  private reload() {
    this.loading = true;
    this.subscription = null;
    this.mandate = null;
    this.sessions = null;
    this.wmp.getSubscription().pipe(
      concatMap(sub => forkJoin([this.wmp.getMandate(), this.wmp.listSessions()]).pipe(map(([mandate, sessions]) => [sub, mandate, sessions] as [SubscriptionDetails, Mandate, SessionDetails[]])))

    )
      .subscribe({
        next: ([sub, mandate, sessions]) => {
          this.subscription = sub;
          this.mandate = mandate;
          this.sessions = sessions;
          this.loading = false;
        },
        error: err => {
          this.subscription = null;
          this.mandate = null;
          this.sessions = null;
          this.solid.listPaymentPointers().subscribe(pps => {
            this.pps = pps;
            if (pps.length > 0) {
              this.subForm.setValue({ pp: pps[0] });
            }
            this.loading = false;
          });
        }
      });

  }

  save(): void {

  }

  createSubscription() {
    if (this.subForm.valid) {
      this.wmp.createSubscription(this.subForm.get('pp')?.value).subscribe(_ => this.reload());
    }
  }

  removeSubscription() {
    this.wmp.removeSubscription().subscribe(_ => this.reload());
  }
}
