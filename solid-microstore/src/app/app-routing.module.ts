import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MixComponent } from './mix/mix.component';
import { PayscrollComponent } from './payscroll/payscroll.component';
import { PaywallComponent } from './paywall/paywall.component';

const routes: Routes = [
  {
    path: 'paywall',
    component: PaywallComponent
  },
  {
    path: 'mix',
    component: MixComponent
  },
  {
    path: 'payscroll',
    component: PayscrollComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
