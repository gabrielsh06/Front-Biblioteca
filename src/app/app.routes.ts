import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';

export const routes: Routes = [
  { path: '', component: PublicLayout },
  { path: 'admin', component: AdminLayout },
  { path: '**', redirectTo: '' }
];
