import { LayoutModule } from '@angular/cdk/layout';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Load solid web-monetization polyfill
import 'solid-wm';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FaucetComponent } from './faucet/faucet.component';
import { MixComponent } from './mix/mix.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PayscrollComponent } from './payscroll/payscroll.component';
import { PaywallComponent } from './paywall/paywall.component';



@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    PaywallComponent,
    PayscrollComponent,
    MixComponent,
    FaucetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
