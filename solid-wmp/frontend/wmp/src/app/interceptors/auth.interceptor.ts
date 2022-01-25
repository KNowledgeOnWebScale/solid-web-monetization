import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = new URL(request.urlWithParams);
    const tok = this.auth.getAccessToken();
    if (url.pathname.startsWith('/api') && tok != null) {
      const authReq = request.clone({ setHeaders: { Authorization: `Bearer ${tok}` } });
      return next.handle(authReq);
    } else {
      return next.handle(request);
    }
  }
}
