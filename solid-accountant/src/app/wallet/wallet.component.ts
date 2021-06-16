import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Quad, Quad_Object } from 'n3';
import { pipe } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SolidService } from '../services/solid.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  prefixes: any;
  profile: Quad[] = [];
  pps: string[] = [];
  ppForm: FormGroup;
  turtle: string;

  constructor(private solid: SolidService, fb: FormBuilder) {
    this.ppForm = fb.group({
      paymentPointerValue: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.reloadData();
  }

  removePointer(pointer: string) {
    this.solid.delPointer(pointer).subscribe(_ => this.reloadData());
  }

  addPointer() {
    if (this.ppForm.valid) {
      this.solid.addPointer(this.ppForm.get('paymentPointerValue').value).subscribe(_ => this.reloadData());
    }
  }

  save(): void {
    this.solid.loadAsTurtle().pipe(switchMap(turtle => this.solid.saveTextTurtle(turtle))).subscribe(res => {
      this.reloadData()
    });
  }

  restore(): void {
    this.solid.restore().subscribe(_ => this.reloadData());
  }

  restoreLocal(): void {
    this.solid.restoreLocal().subscribe(_ => this.reloadData());
  }

  private reloadData() {
    if (this.solid.getSession().info.isLoggedIn) {
      this.solid.loadProfile().pipe(
        switchMap(_ => this.solid.loadAsTurtle())
      ).subscribe(txt => {
        console.log('reloading turtle')
        this.turtle = txt;
        this.solid.listPaymentPointers().subscribe(pps => {
          this.pps = pps;
        })
      });
    }
  }
}
