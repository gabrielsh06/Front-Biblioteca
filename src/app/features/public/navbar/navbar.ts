import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

export interface NavLink {
    label: string;
    path: string;
    queryParams?: Record<string, string>;
}
@Component({
    selector: 'app-navbar',
    imports: [RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {
    private readonly router = inject(Router);
    readonly auth = inject(AuthService);

    readonly navLinks: NavLink[] = [
        { label: 'Catálogo', path: '/catalogo' },
        { label: 'Novedades', path: '/catalogo', queryParams: { orden: 'recent' } },
    ];

    onSearch(event: Event): void {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const query = form.querySelector<HTMLInputElement>('input[type="search"]')?.value.trim() ?? '';

        void this.router.navigate(['/catalogo'], {
            queryParams: query ? { q: query } : {},
        });
    }

    logout(): void {
        this.auth.logout();
        void this.router.navigateByUrl('/');
    }
}
