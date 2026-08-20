import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SyllabusPage } from './syllabus.page';

const routes: Routes = [
  {
    path: '',
    component: SyllabusPage
  },
  {
    path: 'syllabus-details/:id',
    loadChildren: () => import('./syllabus-details/syllabus-details.module').then( m => m.SyllabusDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyllabusPageRoutingModule {}
