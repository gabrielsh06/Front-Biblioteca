import { Routes } from '@angular/router';
import { PublicLayout } from './features/public/layouts/public-layout/public-layout';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { AdminPanel } from './features/admin/pages/admin-panel/admin-panel';
import { Home } from './features/public/pages/home/home';
import { Login } from './features/public/pages/login/login';
import { BookDetail } from './features/public/pages/book-detail/book-detail';
import { Catalog } from './features/public/pages/catalog/catalog';
import { Legal } from './features/public/pages/legal/legal';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: Home,
            },
            {
                path: 'books/:id',
                component: BookDetail,
            },
            {
                path: 'catalogo',
                component: Catalog,
            },
            {
                path: 'legales',
                component: Legal,
            },
        ],
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'admin',
        component: AdminLayout,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', component: AdminPanel, data: { section: 'dashboard' } },
            { path: 'libros', component: AdminPanel, data: { section: 'books' } },
            { path: 'clientes', component: AdminPanel, data: { section: 'clients' } },
            { path: 'prestamos', component: AdminPanel, data: { section: 'loans' } },
            { path: 'donaciones', component: AdminPanel, data: { section: 'donations' } },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
