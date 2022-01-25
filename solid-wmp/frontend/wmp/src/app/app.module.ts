import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CallBackComponent } from './call-back/call-back.component';
import { httpInterceptorProviders } from './interceptors';
import { ManageComponent } from './manage/manage.component';
import { CheckmarkPipe } from './checkmark.pipe';


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ManageComponent,
    CallBackComponent,
    CheckmarkPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    ClipboardModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
