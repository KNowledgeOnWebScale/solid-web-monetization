import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Quad, Quad_Object } from 'n3';
import { pipe } from 'rxjs';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SolidService } from '../services/solid.service';

@Component({
  selector: 'app-payment-pointers',
  templateUrl: './payment-pointers.component.html',
  styleUrls: ['./payment-pointers.component.scss']
})
export class PaymentPointersComponent implements OnInit {
  prefixes: any;
  profile: Quad[] = [];
  pps: string[] = [];
  ppForm: FormGroup;
  turtle: string;

  constructor(private solid: SolidService, fb: FormBuilder) {
    this.ppForm = fb.group({
      paymentPointerValue: ['',[Validators.required, Validators.pattern("^\\$[a-zA-Z0-9\\.\\-_]+$")]]
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
      this.solid.addPointer(this.ppForm.get('paymentPointerValue').value).subscribe(_ => {
        this.ppForm.reset();
        this.reloadData();
      });
    }
  }

  restore(): void {
    this.solid.restore().subscribe(_ => this.reloadData());
  }

  restoreLocal(): void {
    this.solid.restoreLocal().subscribe(_ => this.reloadData());
  }

  get rawTurtle() {
    return this.solid.rawTurtle;
  }

  get webId() {
    return this.solid.webId;
  }

  get ppv() {
    return this.ppForm.get('paymentPointerValue');
  }

  private reloadData() {
    if (this.solid.getSession().info.isLoggedIn) {
      this.solid.loadProfile().pipe(
        switchMap(_ => this.solid.loadAsTurtle())
      ).subscribe(txt => {
        this.turtle = txt;
        this.solid.listPaymentPointers().subscribe(pps => this.pps = pps);
      });
    }
  }
}
