import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PaymentPointersComponent } from './pp/payment-pointers.component';
import { AboutComponent } from './about/about.component';
import { AuthComponent } from './auth/auth.component';
import { LoginBtnComponent } from './components/login-btn/login-btn.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PaymentPointersComponent,
    AboutComponent,
    AuthComponent,
    LoginBtnComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgbTooltipModule
  ],
  providers: [
    // {
    //   provide: LocationStrategy,
    //   useClass: HashLocationStrategy
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
