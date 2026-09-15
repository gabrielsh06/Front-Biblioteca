import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { Home } from './features/public/pages/home/home';
import { Login } from './features/public/pages/login/login';
import { BookDetail } from './features/public/pages/book-detail/book-detail';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: Home
            },
            {
                path: 'books/:id',
                component: BookDetail
            }
        ]
    },
    { 
        path: 'login', 
        component: Login 
    },
    { 
        path: 'admin', 
        component: AdminLayout 
    },
    { 
        path: '**', 
        redirectTo: '' 
    }
];