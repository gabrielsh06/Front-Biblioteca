import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
    BookCategory,
    BookCreateRequest,
    BookOrigin,
    BookResponse,
    BookStatus,
    BookUpdateRequest,
} from '../../../../shared/models/book.model';
import {
    UserCreateRequest,
    UserResponse,
    UserRole,
    UserUpdateRequest,
} from '../../../../shared/models/user.model';
import { BookService } from '../../../../shared/services/book.service';
import { UserService } from '../../../../shared/services/user.service';

type AdminSection = 'dashboard' | 'books' | 'clients' | 'loans' | 'donations';
type AdminModal = 'book' | 'client' | null;

interface BookDraft {
    id: number | null;
    title: string;
    author: string;
    ISBN: string;
    sku: string;
    publisher: string;
    publishedDate: string;
    edition: string;
    pages: string;
    stock: string;
    coverUrl: string;
    category: BookCategory[];
    bookStatus: BookStatus;
    bookOrigin: BookOrigin;
}

interface ClientDraft {
    id: number | null;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    AVAILABLE: 'Disponible',
    CHECKED_OUT: 'Prestado',
    UNAVAILABLE: 'No disponible',
    IN_LIBRARY: 'Solo sala',
};

const BOOK_ORIGIN_LABELS: Record<BookOrigin, string> = {
    LIBRARY_FUND: 'Fondo de biblioteca',
    COMMUNITY_DONATION: 'Donación',
    PURCHASED: 'Comprado',
};

const CATEGORY_LABELS: Record<BookCategory, string> = {
    FICTION: 'Ficción',
    NON_FICTION: 'No ficción',
    POETRY: 'Poesía',
    SCIENCE_FICTION: 'Ciencia ficción',
    CHILDREN: 'Infantil',
    PERSONAL_DEVELOPMENT: 'Desarrollo personal',
};

const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    CUSTOMER: 'Cliente',
};

const EMPTY_BOOK_DRAFT: BookDraft = {
    id: null,
    title: '',
    author: '',
    ISBN: '',
    sku: '',
    publisher: '',
    publishedDate: '',
    edition: '',
    pages: '',
    stock: '1',
    coverUrl: '',
    category: [],
    bookStatus: 'AVAILABLE',
    bookOrigin: 'LIBRARY_FUND',
};

const EMPTY_CLIENT_DRAFT: ClientDraft = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
};

@Component({
    selector: 'app-admin-panel',
    imports: [RouterModule],
    templateUrl: './admin-panel.html',
    styleUrl: './admin-panel.scss',
})
export class AdminPanel {
    private readonly route = inject(ActivatedRoute);
    private readonly bookService = inject(BookService);
    private readonly userService = inject(UserService);
    private readonly destroyRef = inject(DestroyRef);

    readonly section = this.route.snapshot.data['section'] as AdminSection;
    readonly searchTerm = signal('');
    readonly activeFilter = signal('Todos');
    readonly modal = signal<AdminModal>(null);
    readonly notice = signal('');
    readonly formError = signal('');
    readonly isSaving = signal(false);
    readonly isLookingUpIsbn = signal(false);
    readonly isLoadingBooks = signal(false);
    readonly isLoadingUsers = signal(false);

    readonly books = signal<BookResponse[]>([]);
    readonly users = signal<UserResponse[]>([]);
    readonly bookDraft = signal<BookDraft>({ ...EMPTY_BOOK_DRAFT, category: [] });
    readonly clientDraft = signal<ClientDraft>({ ...EMPTY_CLIENT_DRAFT });

    readonly statusOptions: BookStatus[] = ['AVAILABLE', 'CHECKED_OUT', 'IN_LIBRARY', 'UNAVAILABLE'];
    readonly originOptions: BookOrigin[] = ['LIBRARY_FUND', 'COMMUNITY_DONATION', 'PURCHASED'];
    readonly roleOptions: UserRole[] = ['CUSTOMER', 'ADMIN'];
    readonly categories = (Object.keys(CATEGORY_LABELS) as BookCategory[]).map((value) => ({
        value,
        label: CATEGORY_LABELS[value],
    }));

    readonly recentLoans = [
        { initials: 'SM', name: 'Sofía Martínez', book: 'Orgullo y prejuicio', status: 'ACTIVO' },
        { initials: 'CR', name: 'Camila Ruiz', book: 'Babel', status: 'ACTIVO' },
        { initials: 'LF', name: 'Lucía Fernández', book: 'Klara y el sol', status: 'ACTIVO' },
        { initials: 'SM', name: 'Sofía Martínez', book: 'Cien años de soledad', status: 'ACTIVO' },
        { initials: 'DR', name: 'Diego Ramírez', book: 'Rayuela', status: 'VENCIDO' },
    ];

    readonly donations = signal([
        { title: 'El túnel', donor: 'Ramón Vega', date: '2026-09-10', status: 'PENDIENTE' },
        { title: 'Pensar rápido, pensar despacio', donor: 'Elena Mora', date: '2026-09-08', status: 'APROBADO' },
        { title: 'El señor de los anillos', donor: 'Pablo Herrera', date: '2026-09-05', status: 'RECHAZADO' },
        { title: 'La vorágine', donor: 'Natalia Ríos', date: '2026-09-12', status: 'PENDIENTE' },
        { title: 'Historia del tiempo', donor: 'Julián Castro', date: '2026-09-13', status: 'PENDIENTE' },
    ]);

    readonly loans = signal([
        ['Sofía Martínez', 'sofia@mail.com', 'Cien años de soledad', '2026-08-20', '2026-09-03', 'ACTIVO'],
        ['Diego Ramírez', 'diego@mail.com', 'Rayuela', '2026-08-10', '2026-08-24', 'VENCIDO'],
        ['Valentina Torres', 'vale@mail.com', 'El Alquimista', '2026-07-15', '2026-07-29', 'DEVUELTO'],
        ['Lucía Fernández', 'lucia@mail.com', 'Klara y el sol', '2026-09-01', '2026-09-15', 'ACTIVO'],
        ['Mateo Silva', 'mateo@mail.com', 'Sapiens', '2026-06-20', '2026-07-04', 'DEVUELTO'],
        ['Camila Ruiz', 'camila@mail.com', 'Babel', '2026-09-05', '2026-09-19', 'ACTIVO'],
        ['Sofía Martínez', 'sofia@mail.com', 'Orgullo y prejuicio', '2026-09-08', '2026-09-22', 'ACTIVO'],
    ]);

    readonly filteredBooks = computed(() => {
        const search = this.searchTerm().trim().toLowerCase();
        const filter = this.activeFilter();

        return this.books().filter((book) => {
            const matchesSearch = !search || [
                book.title,
                book.author,
                book.ISBN,
                book.publisher ?? '',
                this.categoryText(book),
            ].some((value) => value.toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos' || BOOK_STATUS_LABELS[book.bookStatus] === filter;
            return matchesSearch && matchesFilter;
        });
    });

    readonly filteredClients = computed(() => {
        const search = this.searchTerm().trim().toLowerCase();
        const filter = this.activeFilter();

        return this.users().filter((user) => {
            const matchesSearch = !search || [
                user.firstName,
                user.lastName,
                user.email,
                ROLE_LABELS[user.roles],
            ].some((value) => value.toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos'
                || (filter === 'Activos' && user.state)
                || (filter === 'Suspendidos' && !user.state);
            return matchesSearch && matchesFilter;
        });
    });

    readonly filteredLoans = computed(() => {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        const statusFilter = filter === 'Activos'
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
    });

    readonly filteredDonations = computed(() => {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();

        return this.donations().filter((donation) => {
            const matchesSearch = `${donation.title} ${donation.donor} ${donation.date}`
                .toLowerCase()
                .includes(search);
            const matchesFilter = filter === 'Todos' || donation.status === filter.toUpperCase();
            return matchesSearch && matchesFilter;
        });
    });

    readonly bookDraftValid = computed(() => {
        const draft = this.bookDraft();
        return Boolean(
            draft.title.trim()
            && draft.author.trim()
            && draft.ISBN.trim()
            && draft.category.length
            && Number(draft.stock) >= 0,
        );
    });

    readonly clientDraftValid = computed(() => {
        const draft = this.clientDraft();
        const hasPassword = draft.id !== null || draft.password.length >= 6;
        return Boolean(
            draft.firstName.trim()
            && draft.lastName.trim()
            && draft.email.trim()
            && hasPassword,
        );
    });

    readonly activeUsersCount = computed(() => this.users().filter((user) => user.state).length);

    constructor() {
        this.loadBooks();
        this.loadUsers();
    }

    setSearchTerm(event: Event): void {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }

    setFilter(filter: string): void {
        this.activeFilter.set(filter);
    }

    openBookModal(book?: BookResponse): void {
        this.modal.set('book');
        this.formError.set('');
        this.bookDraft.set(book ? this.toBookDraft(book) : { ...EMPTY_BOOK_DRAFT, category: [] });
    }

    openClientModal(user?: UserResponse): void {
        this.modal.set('client');
        this.formError.set('');
        this.clientDraft.set(user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',
            role: user.roles,
        } : { ...EMPTY_CLIENT_DRAFT });
    }

    closeModal(): void {
        this.modal.set(null);
        this.formError.set('');
        this.bookDraft.set({ ...EMPTY_BOOK_DRAFT, category: [] });
        this.clientDraft.set({ ...EMPTY_CLIENT_DRAFT });
    }

    updateBookText(
        field: 'title' | 'author' | 'ISBN' | 'sku' | 'publisher' | 'publishedDate' | 'edition' | 'pages' | 'stock' | 'coverUrl',
        event: Event,
    ): void {
        const value = (event.target as HTMLInputElement).value;
        this.bookDraft.update((draft) => {
            const updated: BookDraft = { ...draft };
            updated[field] = value;
            return updated;
        });
        this.formError.set('');
    }

    updateBookStatus(value: string): void {
        this.bookDraft.update((draft) => ({ ...draft, bookStatus: value as BookStatus }));
    }

    updateBookOrigin(value: string): void {
        this.bookDraft.update((draft) => ({ ...draft, bookOrigin: value as BookOrigin }));
    }

    toggleBookCategory(category: BookCategory, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        this.bookDraft.update((draft) => ({
            ...draft,
            category: checked
                ? [...new Set([...draft.category, category])]
                : draft.category.filter((item) => item !== category),
        }));
    }

    isCategorySelected(category: BookCategory): boolean {
        return this.bookDraft().category.includes(category);
    }

    updateClientText(field: 'firstName' | 'lastName' | 'email' | 'password', event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.clientDraft.update((draft) => {
            const updated: ClientDraft = { ...draft };
            updated[field] = value;
            return updated;
        });
        this.formError.set('');
    }

    updateClientRole(value: string): void {
        this.clientDraft.update((draft) => ({ ...draft, role: value as UserRole }));
    }

    lookupIsbn(): void {
        const isbn = this.bookDraft().ISBN.trim();
        if (!isbn) {
            this.formError.set('Ingresa un ISBN para buscar sus datos.');
            return;
        }

        this.isLookingUpIsbn.set(true);
        this.formError.set('');
        this.bookService.lookupByIsbn(isbn)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    this.bookDraft.update((draft) => ({
                        ...draft,
                        title: data.title || draft.title,
                        author: data.author || draft.author,
                        coverUrl: data.coverUrl || draft.coverUrl,
                        publisher: data.publisher || draft.publisher,
                        publishedDate: data.publishedDate?.slice(0, 10) || draft.publishedDate,
                        pages: data.pages ? String(data.pages) : draft.pages,
                    }));
                    this.isLookingUpIsbn.set(false);
                },
                error: () => {
                    this.formError.set('No se encontraron datos para ese ISBN.');
                    this.isLookingUpIsbn.set(false);
                },
            });
    }

    saveBook(): void {
        if (!this.bookDraftValid()) {
            this.formError.set('Completa título, autor, ISBN, categoría y stock.');
            return;
        }

        const draft = this.bookDraft();
        const request: BookCreateRequest = {
            title: draft.title.trim(),
            author: draft.author.trim(),
            bookStatus: draft.bookStatus,
            bookOrigin: draft.bookOrigin,
            coverUrl: draft.coverUrl.trim() || undefined,
            ISBN: draft.ISBN.trim(),
            sku: draft.sku.trim() || undefined,
            publisher: draft.publisher.trim() || undefined,
            publishedDate: draft.publishedDate || undefined,
            edition: draft.edition.trim() || undefined,
            pages: draft.pages ? Number(draft.pages) : undefined,
            stock: Number(draft.stock),
            category: draft.category,
        };

        this.isSaving.set(true);
        const operation = draft.id
            ? this.bookService.updateBook(draft.id, request as BookUpdateRequest)
            : this.bookService.createBook(request);

        operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.closeModal();
                this.showNotice(draft.id ? 'Libro actualizado.' : 'Libro agregado al catálogo.');
                this.loadBooks();
            },
            error: (error: unknown) => {
                this.isSaving.set(false);
                this.formError.set(this.getErrorMessage(error, 'No se pudo guardar el libro.'));
            },
        });
    }

    deleteBook(book: BookResponse): void {
        if (!confirm(`¿Eliminar "${book.title}"?`)) {
            return;
        }

        this.bookService.deleteBook(book.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.showNotice('Libro eliminado.');
                    this.loadBooks();
                },
                error: (error: unknown) => this.showNotice(this.getErrorMessage(error, 'No se pudo eliminar el libro.')),
            });
    }

    saveClient(): void {
        if (!this.clientDraftValid()) {
            this.formError.set('Completa nombre, apellido, correo y una contraseña de al menos 6 caracteres.');
            return;
        }

        const draft = this.clientDraft();
        this.isSaving.set(true);

        const operation = draft.id
            ? this.userService.updateUser(draft.id, {
                firstName: draft.firstName.trim(),
                lastName: draft.lastName.trim(),
                email: draft.email.trim(),
            } as UserUpdateRequest)
            : this.userService.createUser({
                firstName: draft.firstName.trim(),
                lastName: draft.lastName.trim(),
                role: draft.role,
                email: draft.email.trim(),
                password: draft.password,
            } as UserCreateRequest);

        operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.closeModal();
                this.showNotice(draft.id ? 'Usuario actualizado.' : 'Usuario agregado.');
                this.loadUsers();
            },
            error: (error: unknown) => {
                this.isSaving.set(false);
                this.formError.set(this.getErrorMessage(error, 'No se pudo guardar el usuario.'));
            },
        });
    }

    deleteUser(user: UserResponse): void {
        if (!confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) {
            return;
        }

        this.userService.deleteUser(user.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.showNotice('Usuario eliminado.');
                    this.loadUsers();
                },
                error: (error: unknown) => this.showNotice(this.getErrorMessage(error, 'No se pudo eliminar el usuario.')),
            });
    }

    statusLabel(status: BookStatus): string {
        return BOOK_STATUS_LABELS[status];
    }

    originLabel(origin: BookOrigin): string {
        return BOOK_ORIGIN_LABELS[origin];
    }

    roleLabel(role: UserRole): string {
        return ROLE_LABELS[role];
    }

    categoryText(book: BookResponse): string {
        return book.category.map((category) => CATEGORY_LABELS[category]).join(', ') || 'Sin categoría';
    }

    updateDonation(title: string, status: string): void {
        this.donations.update((items) => items.map((item) => item.title === title ? { ...item, status } : item));
        this.showNotice(`Donación ${status.toLowerCase()} visualmente.`);
    }

    markLoanReturned(name: string, book: string): void {
        this.loans.update((items) => items.map((loan) => loan[0] === name && loan[2] === book ? [...loan.slice(0, 5), 'DEVUELTO'] : loan));
        this.showNotice('Préstamo marcado como devuelto visualmente.');
    }

    get title(): string {
        return ({
            dashboard: 'Dashboard',
            books: 'Catálogo de libros',
            clients: 'Gestión de clientes',
            loans: 'Gestión de préstamos',
            donations: 'Gestión de donaciones',
        } as Record<AdminSection, string>)[this.section];
    }

    get breadcrumb(): string {
        return this.section === 'dashboard' ? 'Dashboard' : this.title.replace('Gestión de ', '');
    }

    private loadBooks(): void {
        this.isLoadingBooks.set(true);
        this.bookService.getBooks({ page: 0, size: 100, sort: ['title,asc'] })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.books.set(response.content);
                    this.isLoadingBooks.set(false);
                },
                error: () => {
                    this.books.set([]);
                    this.isLoadingBooks.set(false);
                    this.showNotice('No se pudo cargar el catálogo.');
                },
            });
    }

    private loadUsers(): void {
        this.isLoadingUsers.set(true);
        this.userService.getAllUsers()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (users) => {
                    this.users.set(users);
                    this.isLoadingUsers.set(false);
                },
                error: () => {
                    this.users.set([]);
                    this.isLoadingUsers.set(false);
                },
            });
    }

    private toBookDraft(book: BookResponse): BookDraft {
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            ISBN: book.ISBN,
            sku: book.sku ?? '',
            publisher: book.publisher ?? '',
            publishedDate: book.publishedDate?.slice(0, 10) ?? '',
            edition: book.edition ?? '',
            pages: book.pages ? String(book.pages) : '',
            stock: String(book.stock),
            coverUrl: book.coverUrl ?? '',
            category: book.category,
            bookStatus: book.bookStatus,
            bookOrigin: book.bookOrigin,
        };
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 2500);
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        const message = (error as { error?: { message?: string } })?.error?.message;
        return message || fallback;
    }
}
