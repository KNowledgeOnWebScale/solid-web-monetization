import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Example1Component } from './example1/example1.component';

const routes: Routes = [
  {
    path: 'example1',
    component: Example1Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
