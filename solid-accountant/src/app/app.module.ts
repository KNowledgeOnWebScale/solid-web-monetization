import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbTooltipModule, NgbCollapse, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { LoginBtnComponent } from './components/login-btn/login-btn.component';
import { HomeComponent } from './home/home.component';
import { PaymentPointersComponent } from './pp/payment-pointers.component';


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
    NgbTooltipModule,
    NgbCollapseModule
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
