import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { Login } from './features/public/pages/login/login';

export const routes: Routes = [
  { path: '', component: PublicLayout },
  { path: 'login', component: Login },
  { path: 'admin', component: AdminLayout },
  { path: '**', redirectTo: '' }
];