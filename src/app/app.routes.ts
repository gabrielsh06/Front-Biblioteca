import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { AdminPanel } from './features/admin/pages/admin-panel/admin-panel';
import { Home } from './features/public/pages/home/home';
import { Login } from './features/public/pages/login/login';
import { BookDetail } from './features/public/pages/book-detail/book-detail';
import { Catalog } from './features/public/pages/catalog/catalog';
import { MyLoans } from './features/public/pages/my-loans/my-loans';
import { Donate } from './features/public/pages/donate/donate';
import { Register } from './features/public/pages/register/register';
import { ForgotPassword } from './features/public/pages/forgot-password/forgot-password';
import { ResetPassword } from './features/public/pages/reset-password/reset-password';
import { adminGuard } from './shared/guards/admin.guard';
import { authGuard } from './shared/guards/auth.guard';

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
            },
            {
                path: 'catalogo',
                component: Catalog
            },
            {
                path: 'mis-prestamos',
                component: MyLoans,
                canActivate: [authGuard]
            },
            {
                path: 'donar',
                component: Donate
            }
        ]
    },
    { 
        path: 'login', 
        component: Login 
    },
    {
        path: 'registro',
        component: Register
    },
    {
        path: 'recuperar-password',
        component: ForgotPassword
    },
    {
        path: 'restablecer-password',
        component: ResetPassword
    },
    {
        path: 'restablecer-password/:token',
        component: ResetPassword
    },
    {
        path: 'reset-password',
        component: ResetPassword
    },
    {
        path: 'reset-password/:token',
        component: ResetPassword
    },
    { 
        path: 'admin', 
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', component: AdminPanel, data: { section: 'dashboard' } },
            { path: 'libros', component: AdminPanel, data: { section: 'books' } },
            { path: 'clientes', component: AdminPanel, data: { section: 'clients' } },
            { path: 'prestamos', component: AdminPanel, data: { section: 'loans' } },
            { path: 'donaciones', component: AdminPanel, data: { section: 'donations' } },
        ]
    },
    { 
        path: '**', 
        redirectTo: '' 
    }
];