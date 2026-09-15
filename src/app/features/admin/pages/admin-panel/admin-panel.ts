import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
    Book,
    BookOrigin,
    BookStatus,
    BOOK_ORIGIN_LABELS,
    BOOK_STATUS_LABELS,
} from '../../../../shared/models/book.model';
import { BookStorageService } from '../../../../shared/services/book-storage.service';

type AdminSection = 'dashboard' | 'books' | 'clients' | 'loans' | 'donations';

@Component({
    selector: 'app-admin-panel',
    imports: [RouterModule],
    templateUrl: './admin-panel.html' as string,
    styleUrl: './admin-panel.scss' as string,
})
export class AdminPanel {
    private readonly route = inject(ActivatedRoute);
    private readonly bookStorage = inject(BookStorageService);
    readonly section = this.route.snapshot.data['section'] as AdminSection;
    readonly searchTerm = signal('');
    readonly activeFilter = signal('Todos');
    readonly modal = signal<'book' | 'client' | null>(null);
    readonly notice = signal('');
    readonly formError = signal('');
    readonly draft = signal<Record<string, string>>({});

    readonly recentLoans = [
        { initials: 'SM', name: 'Sofía Martínez', book: 'Orgullo y prejuicio', status: 'ACTIVO' },
        { initials: 'CR', name: 'Camila Ruiz', book: 'Babel', status: 'ACTIVO' },
        { initials: 'LF', name: 'Lucía Fernández', book: 'Klara y el sol', status: 'ACTIVO' },
        { initials: 'SM', name: 'Sofía Martínez', book: 'Cien años de soledad', status: 'ACTIVO' },
        { initials: 'DR', name: 'Diego Ramírez', book: 'Rayuela', status: 'VENCIDO' },
    ];

    readonly donations = signal([
        { title: 'El túnel', donor: 'Ramón Vega', date: '2026-09-10', status: 'PENDIENTE' },
        {
            title: 'Pensar rápido, pensar despacio',
            donor: 'Elena Mora',
            date: '2026-09-08',
            status: 'APROBADO',
        },
        {
            title: 'El señor de los anillos',
            donor: 'Pablo Herrera',
            date: '2026-09-05',
            status: 'RECHAZADO',
        },
        { title: 'La vorágine', donor: 'Natalia Ríos', date: '2026-09-12', status: 'PENDIENTE' },
        {
            title: 'Historia del tiempo',
            donor: 'Julián Castro',
            date: '2026-09-13',
            status: 'PENDIENTE',
        },
    ]);

    readonly books = signal<string[][]>([]);

    readonly clients = signal<string[][]>([
        ['Diego Ramírez', 'diego@mail.com', '+34 634 567 890', '2023-11-05', '1', '27', 'ACTIVO'],
        ['Valentina Torres', 'vale@mail.com', '+34 655 123 456', '2024-01-20', '0', '8', 'ACTIVO'],
        [
            'Andrés Gómez',
            'andres@mail.com',
            '+34 677 234 567',
            '2022-08-14',
            '0',
            '42',
            'SUSPENDIDO',
        ],
        ['Lucía Fernández', 'lucia@mail.com', '+34 698 345 678', '2024-06-01', '3', '9', 'ACTIVO'],
        ['Mateo Silva', 'mateo@mail.com', '+34 611 456 789', '2023-04-22', '0', '19', 'ACTIVO'],
        ['Camila Ruiz', 'camila@mail.com', '+34 633 567 890', '2024-02-15', '1', '5', 'ACTIVO'],
        ['Sebastián López', 'seba@mail.com', '+34 654 678 901', '2021-12-03', '0', '61', 'ACTIVO'],
    ]);

    readonly loans = signal([
        [
            'Sofía Martínez',
            'sofia@mail.com',
            'Cien años de soledad',
            '2026-08-20',
            '2026-09-03',
            'ACTIVO',
        ],
        ['Diego Ramírez', 'diego@mail.com', 'Rayuela', '2026-08-10', '2026-08-24', 'VENCIDO'],
        [
            'Valentina Torres',
            'vale@mail.com',
            'El Alquimista',
            '2026-07-15',
            '2026-07-29',
            'DEVUELTO',
        ],
        [
            'Lucía Fernández',
            'lucia@mail.com',
            'Klara y el sol',
            '2026-09-01',
            '2026-09-15',
            'ACTIVO',
        ],
        ['Mateo Silva', 'mateo@mail.com', 'Sapiens', '2026-06-20', '2026-07-04', 'DEVUELTO'],
        ['Camila Ruiz', 'camila@mail.com', 'Babel', '2026-09-05', '2026-09-19', 'ACTIVO'],
        [
            'Sofía Martínez',
            'sofia@mail.com',
            'Orgullo y prejuicio',
            '2026-09-08',
            '2026-09-22',
            'ACTIVO',
        ],
    ]);

    constructor() {
        void this.loadStoredBooks();
    }

    private async loadStoredBooks(): Promise<void> {
        const books = await this.bookStorage.loadBooks();
        this.books.set(books.map((book) => this.toAdminBookRow(book)));
    }

    get filteredBooks(): string[][] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        return this.books().filter((book) => {
            const matchesSearch = book.some((value) => value.toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos' || book[5] === filter.toUpperCase();
            return matchesSearch && matchesFilter;
        });
    }

    get filteredClients(): string[][] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        const statusFilter =
            filter === 'Activos'
                ? 'ACTIVO'
                : filter === 'Suspendidos'
                  ? 'SUSPENDIDO'
                  : filter.toUpperCase();
        return this.clients().filter((client) => {
            const matchesSearch = client.some((value) => value.toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos' || client[6] === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }

    get filteredLoans(): string[][] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        const statusFilter =
            filter === 'Activos'
                ? 'ACTIVO'
                : filter === 'Vencidos'
                  ? 'VENCIDO'
                  : filter === 'Devueltos'
                    ? 'DEVUELTO'
                    : filter.toUpperCase();
        return this.loans().filter((loan) => {
            const matchesSearch = loan.some((value) => value.toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos' || loan[5] === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }

    get filteredDonations() {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        return this.donations().filter((donation) => {
            const matchesSearch = `${donation.title} ${donation.donor} ${donation.date}`
                .toLowerCase()
                .includes(search);
            const matchesFilter = filter === 'Todos' || donation.status === filter.toUpperCase();
            return matchesSearch && matchesFilter;
        });
    }

    setSearchTerm(event: Event): void {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }

    setFilter(filter: string): void {
        this.activeFilter.set(filter);
    }

    openModal(type: 'book' | 'client'): void {
        this.modal.set(type);
        this.formError.set('');
        this.draft.set(
            type === 'book'
                ? {
                      title: '',
                      author: '',
                      year: new Date().getFullYear().toString(),
                      isbn: '',
                      publisher: '',
                      pages: '',
                      category: 'Ficción',
                      status: 'DISPONIBLE',
                      origin: 'BIBLIOTECA',
                  }
                : {
                      name: '',
                      email: '',
                      phone: '',
                      registeredAt: new Date().toISOString().slice(0, 10),
                      status: 'ACTIVO',
                  },
        );
    }

    closeModal(): void {
        this.modal.set(null);
        this.formError.set('');
        this.draft.set({});
    }

    updateDraft(field: string, event: Event): void {
        this.draft.update((current) => ({
            ...current,
            [field]: (event.target as HTMLInputElement | HTMLSelectElement).value,
        }));
        this.formError.set('');
    }

    get isDraftComplete(): boolean {
        const fields =
            this.modal() === 'book'
                ? [
                      'title',
                      'author',
                      'year',
                      'isbn',
                      'publisher',
                      'pages',
                      'category',
                      'status',
                      'origin',
                  ]
                : ['name', 'email', 'phone', 'registeredAt', 'status'];
        return fields.every((field) => Boolean(this.draft()[field]?.trim()));
    }

    confirmAdd(): void {
        if (!this.isDraftComplete) {
            this.formError.set('Completa todos los campos antes de guardar.');
            return;
        }

        const values = this.draft();
        if (this.modal() === 'book') {
            const book = this.createBook(values);
            this.bookStorage.saveBook(book);
            this.books.set(
                this.bookStorage.getBooks().map((storedBook) => this.toAdminBookRow(storedBook)),
            );
            this.notice.set('Libro agregado al catálogo.');
        } else {
            this.clients.update((items) => [
                ...items,
                [
                    values['name'],
                    values['email'],
                    values['phone'],
                    values['registeredAt'],
                    '0',
                    '0',
                    values['status'],
                ],
            ]);
            this.notice.set('Cliente agregado visualmente.');
        }
        this.closeModal();
        setTimeout(() => this.notice.set(''), 2500);
    }

    private createBook(values: Record<string, string>): Book {
        return {
            id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: values['title'].trim(),
            author: values['author'].trim(),
            publishedYear: Number(values['year']),
            isbn: values['isbn'].trim(),
            publisher: values['publisher'].trim(),
            pages: Number(values['pages']),
            genres: [values['category']],
            status: this.toBookStatus(values['status']),
            origin: this.toBookOrigin(values['origin']),
            likesCount: 0,
            synopsis: 'Este libro fue agregado al catálogo de la biblioteca.',
        };
    }

    private toAdminBookRow(book: Book): string[] {
        return [
            book.title,
            `${book.author} · ${book.publishedYear ?? 'Sin año'}`,
            book.genres?.[0] ?? 'Sin categoría',
            book.isbn ?? 'Sin ISBN',
            String(book.pages ?? '—'),
            BOOK_STATUS_LABELS[book.status].toUpperCase(),
            book.origin ? BOOK_ORIGIN_LABELS[book.origin].toUpperCase() : 'SIN ORIGEN',
        ];
    }

    private toBookStatus(status: string): BookStatus {
        const statuses: Record<string, BookStatus> = {
            DISPONIBLE: 'available',
            PRESTADO: 'checked-out',
            'SOLO SALA': 'in-library',
        };

        return statuses[status] ?? 'unavailable';
    }

    private toBookOrigin(origin: string): BookOrigin {
        return origin === 'DONADO' ? 'community-donation' : 'library-fund';
    }

    updateDonation(title: string, status: string): void {
        this.donations.update((items) =>
            items.map((item) => (item.title === title ? { ...item, status } : item)),
        );
        this.notice.set(`Donación ${status.toLowerCase()} visualmente.`);
        setTimeout(() => this.notice.set(''), 2500);
    }

    markLoanReturned(name: string, book: string): void {
        this.loans.update((items) =>
            items.map((loan) =>
                loan[0] === name && loan[2] === book ? [...loan.slice(0, 5), 'DEVUELTO'] : loan,
            ),
        );
        this.notice.set('Préstamo marcado como devuelto visualmente.');
        setTimeout(() => this.notice.set(''), 2500);
    }

    get title(): string {
        return (
            {
                dashboard: 'Dashboard',
                books: 'Catálogo de libros',
                clients: 'Gestión de clientes',
                loans: 'Gestión de préstamos',
                donations: 'Gestión de donaciones',
            } as Record<AdminSection, string>
        )[this.section];
    }

    get breadcrumb(): string {
        return this.section === 'dashboard' ? 'Dashboard' : this.title.replace('Gestión de ', '');
    }
}
