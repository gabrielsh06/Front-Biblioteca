import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface NavLink {
    label: string;
    path: string;
}
export interface BookCategory {
    label: string;
    slug: string;
    icon: string;
}

@Component({
    selector: 'app-navbar',
    imports: [RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {
    // Lista de enlaces de navegación (categorías / secciones del catálogo).
    // TODO: reemplazar por datos reales cuando exista el servicio de categorías.
    readonly navLinks: NavLink[] = [
        { label: 'Catálogo', path: '/catalogo' },
        { label: 'Novedades', path: '/novedades' },
    ];
    
    readonly categories: BookCategory[] = [
        { label: 'Ficción', slug: 'ficcion', icon: '📖' },
        { label: 'No ficción', slug: 'no-ficcion', icon: '🧭' },
        { label: 'Poesía', slug: 'poesia', icon: '🌿' },
        { label: 'Ciencia Ficción', slug: 'ciencia-ficcion', icon: '🚀' },
        { label: 'Infantil', slug: 'infantil', icon: '🌈' },
        { label: 'Desarrollo Personal', slug: 'desarrollo-personal', icon: '✨' },
    ];

    readonly notificationsCount = signal(3);
    readonly isMobileMenuOpen = signal(false);

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update((open) => !open);
    }

    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }
}
