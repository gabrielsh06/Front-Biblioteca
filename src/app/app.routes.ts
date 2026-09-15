import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { Home } from './features/public/pages/home/home';

export const routes: Routes = [
    {
        path: '', component: PublicLayout,
        children: [
            {
                path: '',
                component: Home
            },
        ]
    },
  { path: 'admin', component: AdminLayout },
  { path: '**', redirectTo: '' }
];
