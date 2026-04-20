import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./student/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'about',
    loadChildren: () => import('./basic/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./student/profile/profile.module').then( m => m.ProfilePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'attendance',
    loadChildren: () => import('./student/attendances/attendances.module').then( m => m.AttendancesPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'calender',
    loadChildren: () => import('./student/calendar/calendar.module').then( m => m.CalendarPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'exams',
    loadChildren: () => import('./student/exams/exams.module').then( m => m.ExamsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'fees',
    loadChildren: () => import('./student/fees/fees.module').then( m => m.FeesPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'homework',
    loadChildren: () => import('./student/homeworks/homeworks.module').then( m => m.HomeworksPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./student/settings/settings.module').then( m => m.SettingsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'syllabus',
    loadChildren: () => import('./student/syllabus/syllabus.module').then( m => m.SyllabusPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'privacy',
    loadChildren: () => import('./basic/privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./basic/terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'meetings',
    loadChildren: () => import('./student/meetings/meetings.module').then( m => m.MeetingsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'transports',
    loadChildren: () => import('./student/transports/transports.module').then( m => m.TransportsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'complaints',
    loadChildren: () => import('./student/complaints/complaints.module').then( m => m.ComplaintsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'feedbacks',
    loadChildren: () => import('./student/feedbacks/feedbacks.module').then( m => m.FeedbacksPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./student/notifications/notifications.module').then( m => m.NotificationsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./student/messages/messages.module').then( m => m.MessagesPageModule),
    canLoad: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
