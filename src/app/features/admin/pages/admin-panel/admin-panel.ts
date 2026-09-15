import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type AdminSection = 'dashboard' | 'books' | 'clients' | 'loans' | 'donations';

@Component({
    selector: 'app-admin-panel',
    imports: [RouterModule],
    templateUrl: './admin-panel.html' as string,
    styleUrl: './admin-panel.scss' as string,
})
export class AdminPanel {
    private readonly route = inject(ActivatedRoute);
    readonly section = this.route.snapshot.data['section'] as AdminSection;

    readonly recentLoans = [
        { initials: 'SM', name: 'Sofía Martínez', book: 'Orgullo y prejuicio', status: 'ACTIVO' },
        { initials: 'CR', name: 'Camila Ruiz', book: 'Babel', status: 'ACTIVO' },
        { initials: 'LF', name: 'Lucía Fernández', book: 'Klara y el sol', status: 'ACTIVO' },
        { initials: 'SM', name: 'Sofía Martínez', book: 'Cien años de soledad', status: 'ACTIVO' },
        { initials: 'DR', name: 'Diego Ramírez', book: 'Rayuela', status: 'VENCIDO' },
    ];

    readonly donations = [
        { title: 'El túnel', donor: 'Ramón Vega', date: '2026-09-10', status: 'PENDIENTE' },
        { title: 'Pensar rápido, pensar despacio', donor: 'Elena Mora', date: '2026-09-08', status: 'APROBADO' },
        { title: 'El señor de los anillos', donor: 'Pablo Herrera', date: '2026-09-05', status: 'RECHAZADO' },
        { title: 'La vorágine', donor: 'Natalia Ríos', date: '2026-09-12', status: 'PENDIENTE' },
        { title: 'Historia del tiempo', donor: 'Julián Castro', date: '2026-09-13', status: 'PENDIENTE' },
    ];

    readonly books = [
        ['Cien años de soledad', 'Gabriel García Márquez · 1967', 'Ficción', '978-84-397-0468-9', '471', 'DISPONIBLE', 'BIBLIOTECA'],
        ['La casa de los espíritus', 'Isabel Allende · 1982', 'Ficción', '978-84-08-04254-3', '432', 'PRESTADO', 'BIBLIOTECA'],
        ['El nombre del viento', 'Patrick Rothfuss · 2007', 'Ficción', '978-84-9800-235-4', '662', 'DISPONIBLE', 'DONADO'],
        ['Rayuela', 'Julio Cortázar · 1963', 'Ficción', '978-84-376-0494-7', '600', 'SOLO SALA', 'BIBLIOTECA'],
        ['El Alquimista', 'Paulo Coelho · 1988', 'Desarrollo Personal', '978-84-08-17432-1', '197', 'DISPONIBLE', 'DONADO'],
        ['Pedro Páramo', 'Juan Rulfo · 1955', 'Ficción', '978-84-376-0093-2', '124', 'DISPONIBLE', 'BIBLIOTECA'],
    ];

    readonly clients = [
        ['Diego Ramírez', 'diego@mail.com', '+34 634 567 890', '2023-11-05', '1', '27', 'ACTIVO'],
        ['Valentina Torres', 'vale@mail.com', '+34 655 123 456', '2024-01-20', '0', '8', 'ACTIVO'],
        ['Andrés Gómez', 'andres@mail.com', '+34 677 234 567', '2022-08-14', '0', '42', 'SUSPENDIDO'],
        ['Lucía Fernández', 'lucia@mail.com', '+34 698 345 678', '2024-06-01', '3', '9', 'ACTIVO'],
        ['Mateo Silva', 'mateo@mail.com', '+34 611 456 789', '2023-04-22', '0', '19', 'ACTIVO'],
        ['Camila Ruiz', 'camila@mail.com', '+34 633 567 890', '2024-02-15', '1', '5', 'ACTIVO'],
        ['Sebastián López', 'seba@mail.com', '+34 654 678 901', '2021-12-03', '0', '61', 'ACTIVO'],
    ];

    readonly loans = [
        ['Sofía Martínez', 'sofia@mail.com', 'Cien años de soledad', '2026-08-20', '2026-09-03', 'ACTIVO'],
        ['Diego Ramírez', 'diego@mail.com', 'Rayuela', '2026-08-10', '2026-08-24', 'VENCIDO'],
        ['Valentina Torres', 'vale@mail.com', 'El Alquimista', '2026-07-15', '2026-07-29', 'DEVUELTO'],
        ['Lucía Fernández', 'lucia@mail.com', 'Klara y el sol', '2026-09-01', '2026-09-15', 'ACTIVO'],
        ['Mateo Silva', 'mateo@mail.com', 'Sapiens', '2026-06-20', '2026-07-04', 'DEVUELTO'],
        ['Camila Ruiz', 'camila@mail.com', 'Babel', '2026-09-05', '2026-09-19', 'ACTIVO'],
        ['Sofía Martínez', 'sofia@mail.com', 'Orgullo y prejuicio', '2026-09-08', '2026-09-22', 'ACTIVO'],
    ];

    get title(): string {
        return ({ dashboard: 'Dashboard', books: 'Catálogo de libros', clients: 'Gestión de clientes', loans: 'Gestión de préstamos', donations: 'Gestión de donaciones' } as Record<AdminSection, string>)[this.section];
    }

    get breadcrumb(): string { return this.section === 'dashboard' ? 'Dashboard' : this.title.replace('Gestión de ', ''); }
}
