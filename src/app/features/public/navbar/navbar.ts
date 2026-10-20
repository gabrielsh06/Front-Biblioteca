import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

export interface NavLink {
    label: string;
    path: string;
}

@Component({
    selector: 'app-navbar',
    imports: [RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {
    readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly navLinks: NavLink[] = [
        { label: 'Catálogo', path: '/catalogo' },
        { label: 'Novedades', path: '/novedades' },
    ];
    readonly displayName = computed(() => {
        const user = this.authService.currentUser();
        return user ? `${user.firstName} ${user.lastName}`.trim() : '';
    });

    logout(): void {
        this.authService.logout();
        void this.router.navigateByUrl('/');
    }
}
