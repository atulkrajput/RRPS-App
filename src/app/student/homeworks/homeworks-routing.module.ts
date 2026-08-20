import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeworksPage } from './homeworks.page';

const routes: Routes = [
  {
    path: '',
    component: HomeworksPage
  },
  {
    path: 'homework-details/:id',
    loadChildren: () => import('./homework-details/homework-details.module').then( m => m.HomeworkDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeworksPageRoutingModule {}
