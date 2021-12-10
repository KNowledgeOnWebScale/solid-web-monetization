import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaucetComponent } from './faucet/faucet.component';
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
  },
  {
    path: 'faucet',
    component: FaucetComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
