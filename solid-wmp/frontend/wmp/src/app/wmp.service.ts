import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mandate, SessionDetails, SessionGraph, SubscriptionDetails } from './types';

@Injectable({
  providedIn: 'root'
})
export class WmpService {

  constructor(private http: HttpClient) { }
  getSubscription(): Observable<SubscriptionDetails> {
    return this.http.get<SubscriptionDetails>(url('/api/me/subscription'));
  }

  createSubscription(paymentPointer: string): Observable<void> {
    return this.http.post<void>(url('/api/me/subscription'), { paymentPointer });
  }

  removeSubscription(): Observable<void> {
    return this.http.delete<void>(url('/api/me/subscription'));
  }

  getMandate(): Observable<Mandate> {
    return this.http.get<Mandate>(url('/api/me/subscription/mandate'));
  }

  listSessions(): Observable<SessionGraph> {
    return this.http.get<SessionGraph>(url('/api/me/sessions'));
  }
}

function url(path: string): string {
  return document.location.origin + path;
}
