import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  // Lista de enlaces de navegación (categorías / secciones del catálogo).
  // TODO: reemplazar por datos reales cuando exista el servicio de categorías.
  readonly navLinks: NavLink[] = [
    { label: 'Catálogo', path: '/catalogo' },
    { label: 'Novedades', path: '/novedades' },
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