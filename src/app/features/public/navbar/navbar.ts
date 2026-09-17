import { Component } from '@angular/core';
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
    readonly navLinks: NavLink[] = [
        { label: 'Catálogo', path: '/catalogo' },
        { label: 'Novedades', path: '/novedades' },
    ];

}
