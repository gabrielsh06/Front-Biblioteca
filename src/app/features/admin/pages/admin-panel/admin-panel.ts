import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { openLibraryCover, toApiCategory, toApiOrigin, toApiStatus, toFrontCategorySlug, toFrontOrigin, toFrontStatus, API_CATEGORY_LABELS } from '../../../../shared/mappers/book.mapper';
import { ApiAdminDashboard, ApiBook, ApiBookCondition, ApiBookRequest, ApiDonation, ApiDonationStatus, ApiLoan, ApiUser } from '../../../../shared/models/api.model';
import { BookOrigin, BookStatus, BOOK_ORIGIN_LABELS, BOOK_STATUS_LABELS, PARENT_CATEGORIES } from '../../../../shared/models/book.model';
import { AdminService } from '../../../../shared/services/admin.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { DonationService } from '../../../../shared/services/donation.service';
import { LoanService } from '../../../../shared/services/loan.service';
import { UserService } from '../../../../shared/services/user.service';

type AdminSection = 'dashboard' | 'books' | 'clients' | 'loans' | 'donations';

interface AdminBookRow {
    id: number;
    title: string;
    author: string;
    year: string;
    category: string;
    isbn: string;
    pages: string;
    status: string;
    origin: string;
}

interface AdminClientRow {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    role: string;
    state: 'ACTIVO' | 'INACTIVO';
}

interface AdminLoanRow {
    id: number;
    userEmail: string;
    bookTitle: string;
    loanDate: string;
    dueDate: string;
    returnedDate: string;
    status: 'ACTIVO' | 'VENCIDO' | 'DEVUELTO';
}

interface AdminDonationRow {
    id: number;
    title: string;
    author: string;
    donor: string;
    donorEmail: string;
    category: string;
    condition: string;
    date: string;
    status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    isbn: string;
    notes: string;
    rejectionReason: string;
}

const DONATION_STATUS_LABELS: Record<ApiDonationStatus, AdminDonationRow['status']> = {
    PENDING: 'PENDIENTE',
    APPROVED: 'APROBADO',
    REJECTED: 'RECHAZADO',
};

const BOOK_CONDITION_LABELS: Record<ApiBookCondition, string> = {
    EXCELLENT: 'EXCELENTE',
    GOOD: 'BUENO',
    FAIR: 'ACEPTABLE',
};

@Component({
    selector: 'app-admin-panel',
    imports: [RouterModule],
    templateUrl: './admin-panel.html' as string,
    styleUrl: './admin-panel.scss' as string,
})
export class AdminPanel {
    private readonly route = inject(ActivatedRoute);
    private readonly bookApi = inject(BookApiService);
    private readonly loanService = inject(LoanService);
    private readonly userService = inject(UserService);
    private readonly donationService = inject(DonationService);
    private readonly adminService = inject(AdminService);
    readonly auth = inject(AuthService);

    readonly section = this.route.snapshot.data['section'] as AdminSection;
    readonly searchTerm = signal('');
    readonly activeFilter = signal('Todos');
    readonly modal = signal<'book' | 'client' | null>(null);
    readonly notice = signal('');
    readonly error = signal('');
    readonly formError = signal('');
    readonly draft = signal<Record<string, string>>({});
    readonly isLoading = signal(true);
    readonly isSubmitting = signal(false);
    readonly isbnLookupLoading = signal(false);
    readonly editingBookId = signal<number | null>(null);
    readonly editingClientId = signal<number | null>(null);

    readonly dashboard = signal<ApiAdminDashboard | null>(null);
    readonly books = signal<AdminBookRow[]>([]);
    readonly clients = signal<AdminClientRow[]>([]);
    readonly loans = signal<AdminLoanRow[]>([]);
    readonly categories = PARENT_CATEGORIES;
    readonly statusOptions = Object.entries(BOOK_STATUS_LABELS) as [BookStatus, string][];
    readonly originOptions = Object.entries(BOOK_ORIGIN_LABELS) as [BookOrigin, string][];

    readonly recentLoans = computed(() => this.loans().slice(0, 5));
    readonly overdueCount = computed(() => this.loans().filter((loan) => loan.status === 'VENCIDO').length);
    readonly today = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    readonly donations = signal<AdminDonationRow[]>([]);
    readonly pendingDonations = computed(() => this.donations().filter((donation) => donation.status === 'PENDIENTE'));
    readonly pendingDonationCount = computed(() => this.pendingDonations().length);

    constructor() {
        void this.loadSection();
    }

    private async loadSection(): Promise<void> {
        this.isLoading.set(true);
        this.error.set('');

        try {
            switch (this.section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'books':
                    await this.loadBooks();
                    break;
                case 'clients':
                    await this.loadClients();
                    break;
                case 'loans':
                    await this.loadLoans();
                    break;
                case 'donations':
                    await this.loadDonations();
                    break;
            }
        } catch {
            this.error.set('No se pudo cargar la información. Intenta de nuevo más tarde.');
        } finally {
            this.isLoading.set(false);
        }
    }

    private async loadDashboard(): Promise<void> {
        const [dashboard, loans, donations] = await Promise.all([
            firstValueFrom(this.adminService.getDashboard()),
            firstValueFrom(this.loanService.allLoans()),
            firstValueFrom(this.donationService.getAll()),
        ]);

        this.dashboard.set(dashboard);
        this.loans.set(loans.map((loan) => this.toLoanRow(loan)));
        this.donations.set(donations.map((donation) => this.toDonationRow(donation)));
    }

    private async loadBooks(): Promise<void> {
        const page = await firstValueFrom(this.bookApi.getBooks({ size: 200 }));
        this.books.set(page.content.map((book) => this.toBookRow(book)));
    }

    private async loadClients(): Promise<void> {
        const users = await firstValueFrom(this.userService.getAllUsers());
        this.clients.set(users.map((user) => this.toClientRow(user)));
    }

    private async loadLoans(): Promise<void> {
        const loans = await firstValueFrom(this.loanService.allLoans());
        this.loans.set(loans.map((loan) => this.toLoanRow(loan)));
    }

    private async loadDonations(): Promise<void> {
        const donations = await firstValueFrom(this.donationService.getAll());
        this.donations.set(donations.map((donation) => this.toDonationRow(donation)));
    }

    get filteredBooks(): AdminBookRow[] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        return this.books().filter((book) => {
            const matchesSearch = Object.values(book).some((value) => String(value).toLowerCase().includes(search));
            const matchesFilter = filter === 'Todos' || book.status === filter;
            return matchesSearch && matchesFilter;
        });
    }

    get filteredClients(): AdminClientRow[] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        const stateFilter = filter === 'Activos' ? 'ACTIVO' : filter === 'Suspendidos' ? 'INACTIVO' : '';
        return this.clients().filter((client) => {
            const matchesSearch = [client.name, client.email, client.role].some((value) =>
                value.toLowerCase().includes(search),
            );
            const matchesFilter = filter === 'Todos' || client.state === stateFilter;
            return matchesSearch && matchesFilter;
        });
    }

    get filteredLoans(): AdminLoanRow[] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        const statusFilter = filter === 'Activos' ? 'ACTIVO' : filter === 'Vencidos' ? 'VENCIDO' : filter === 'Devueltos' ? 'DEVUELTO' : '';
        return this.loans().filter((loan) => {
            const matchesSearch = [loan.userEmail, loan.bookTitle].some((value) =>
                value.toLowerCase().includes(search),
            );
            const matchesFilter = filter === 'Todos' || loan.status === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }

    get filteredDonations(): AdminDonationRow[] {
        const search = this.searchTerm().toLowerCase();
        const filter = this.activeFilter();
        return this.donations().filter((donation) => {
            const matchesSearch = [
                donation.title,
                donation.author,
                donation.donor,
                donation.donorEmail,
                donation.isbn,
                donation.category,
            ].some((value) => value.toLowerCase().includes(search));
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
        if (type === 'book') {
            void this.openBookModal();
            return;
        }

        void this.openClientModal();
    }

    async openClientModal(client?: AdminClientRow): Promise<void> {
        this.modal.set('client');
        this.editingClientId.set(client?.id ?? null);
        this.formError.set('');
        this.draft.set({
            firstName: '', lastName: '', email: '', password: '', role: 'CUSTOMER', state: 'true',
        });

        if (!client) {
            return;
        }

        try {
            const user = await firstValueFrom(this.userService.getUser(client.id));

            if (this.modal() !== 'client' || this.editingClientId() !== client.id) {
                return;
            }

            this.draft.set({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '',
                role: user.roles,
                state: user.state ? 'true' : 'false',
            });
        } catch {
            this.formError.set('No se pudieron cargar los datos del cliente.');
        }
    }

    async openBookModal(book?: AdminBookRow): Promise<void> {
        this.modal.set('book');
        this.editingBookId.set(book?.id ?? null);
        this.formError.set('');
        this.draft.set({
            title: '', author: '', year: new Date().getFullYear().toString(), isbn: '',
            publisher: '', pages: '', stock: '1', category: 'fiction', status: 'available', origin: 'library-fund',
            coverUrl: '',
        });

        if (!book) {
            return;
        }

        try {
            const apiBook = await firstValueFrom(this.bookApi.getBook(book.id));

            if (this.modal() !== 'book' || this.editingBookId() !== book.id) {
                return;
            }

            this.draft.set({
                title: apiBook.title,
                author: apiBook.author,
                year: apiBook.publishedDate?.slice(0, 4) ?? new Date().getFullYear().toString(),
                isbn: apiBook.ISBN ?? '',
                publisher: apiBook.publisher ?? '',
                pages: apiBook.pages != null ? String(apiBook.pages) : '',
                stock: apiBook.stock != null ? String(apiBook.stock) : '0',
                category: apiBook.category?.length ? toFrontCategorySlug(apiBook.category[0]) : 'fiction',
                status: toFrontStatus(apiBook.bookStatus ?? 'UNAVAILABLE'),
                origin: toFrontOrigin(apiBook.bookOrigin ?? 'LIBRARY_FUND'),
                coverUrl: apiBook.coverUrl ?? '',
            });
        } catch {
            this.formError.set('No se pudieron cargar los datos del libro.');
        }
    }

    closeModal(): void {
        this.modal.set(null);
        this.editingBookId.set(null);
        this.editingClientId.set(null);
        this.formError.set('');
        this.draft.set({});
    }

    updateDraft(field: string, event: Event): void {
        this.draft.update((current) => ({ ...current, [field]: (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value }));
        this.formError.set('');
    }

    get isDraftComplete(): boolean {
        if (this.modal() === 'book') {
            const fields = ['title', 'author', 'year', 'isbn', 'publisher', 'pages', 'stock', 'category', 'status', 'origin'];
            return fields.every((field) => Boolean(this.draft()[field]?.trim()));
        }

        const fields = this.editingClientId() !== null
            ? ['firstName', 'lastName', 'email']
            : ['firstName', 'lastName', 'email', 'password', 'role'];

        return fields.every((field) => Boolean(this.draft()[field]?.trim()));
    }

    confirmAdd(): void {
        if (!this.isDraftComplete) {
            this.formError.set('Completa todos los campos antes de guardar.');
            return;
        }

        const values = this.draft();
        this.isSubmitting.set(true);
        this.formError.set('');

        if (this.modal() === 'book') {
            const editingId = this.editingBookId();
            const request: ApiBookRequest = {
                title: values['title'].trim(),
                author: values['author'].trim(),
                ISBN: values['isbn'].trim(),
                publisher: values['publisher'].trim(),
                pages: Number(values['pages']),
                stock: Number(values['stock']),
                publishedDate: `${values['year']}-01-01T00:00:00`,
                coverUrl: values['coverUrl'] || openLibraryCover(values['isbn'].trim()),
                category: [toApiCategory(values['category']) ?? 'FICTION'],
                bookStatus: toApiStatus(values['status'] as BookStatus),
                bookOrigin: toApiOrigin(values['origin'] as BookOrigin),
            };
            const operation = editingId !== null
                ? this.bookApi.updateBook(editingId, request)
                : this.bookApi.registerBook(request);

            operation.subscribe({
                next: async () => {
                    await this.loadBooks();
                    this.isSubmitting.set(false);
                    this.closeModal();
                    this.showNotice(editingId !== null ? 'Libro actualizado.' : 'Libro agregado al catálogo.');
                },
                error: (error: HttpErrorResponse) => this.handleFormError(error),
            });
            return;
        }

        const editingClientId = this.editingClientId();

        if (editingClientId !== null) {
            this.userService.updateUser(editingClientId, {
                firstName: values['firstName'].trim(),
                lastName: values['lastName'].trim(),
                email: values['email'].trim(),
                state: values['state'] !== 'false',
            }).subscribe({
                next: async () => {
                    await this.loadClients();
                    this.isSubmitting.set(false);
                    this.closeModal();
                    this.showNotice('Cliente actualizado correctamente.');
                },
                error: (error: HttpErrorResponse) => this.handleFormError(error),
            });
            return;
        }

        if (values['password'].trim().length < 6) {
            this.isSubmitting.set(false);
            this.formError.set('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        this.userService.registerUser({
            firstName: values['firstName'].trim(),
            lastName: values['lastName'].trim(),
            email: values['email'].trim(),
            password: values['password'],
            role: values['role'] === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
        }).subscribe({
            next: async () => {
                await this.loadClients();
                this.isSubmitting.set(false);
                this.closeModal();
                this.showNotice('Cliente registrado correctamente.');
            },
            error: (error: HttpErrorResponse) => this.handleFormError(error),
        });
    }

    lookupIsbn(): void {
        const isbn = this.draft()['isbn']?.trim();

        if (!isbn) {
            this.formError.set('Ingresa un ISBN para buscarlo en OpenLibrary.');
            return;
        }

        this.isbnLookupLoading.set(true);
        this.formError.set('');

        this.bookApi.lookupByIsbn(isbn).subscribe({
            next: (lookup) => {
                this.isbnLookupLoading.set(false);
                this.draft.update((current) => ({
                    ...current,
                    isbn: lookup.ISBN || isbn,
                    title: lookup.title || current['title'],
                    author: lookup.author || current['author'],
                    publisher: lookup.publisher || current['publisher'],
                    pages: lookup.pages ? String(lookup.pages) : current['pages'],
                    year: lookup.publishedDate?.slice(0, 4) || current['year'],
                    coverUrl: lookup.coverUrl || openLibraryCover(lookup.ISBN || isbn) || current['coverUrl'],
                }));
                this.showNotice('Datos completados desde OpenLibrary.');
            },
            error: () => {
                this.isbnLookupLoading.set(false);
                this.formError.set('No se encontró información para ese ISBN. Puedes completar los campos manualmente.');
            },
        });
    }

    deleteBook(book: AdminBookRow): void {
        if (!window.confirm(`¿Eliminar "${book.title}" del catálogo?`)) {
            return;
        }

        this.bookApi.deleteBook(book.id).subscribe({
            next: async () => {
                await this.loadBooks();
                this.showNotice('Libro eliminado del catálogo.');
            },
            error: (error: HttpErrorResponse) => this.showError(
                error.error?.message ?? 'No se pudo eliminar el libro.',
            ),
        });
    }

    canToggleClientState(client: AdminClientRow): boolean {
        return client.email !== this.auth.currentUser()?.email;
    }

    toggleClientState(client: AdminClientRow): void {
        if (!this.canToggleClientState(client)) {
            this.showError('No puedes suspender tu propia cuenta.');
            return;
        }

        const state = client.state !== 'ACTIVO';

        this.userService.updateUser(client.id, {
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            state,
        }).subscribe({
            next: async () => {
                await this.loadClients();
                this.showNotice(state ? 'Cliente activado.' : 'Cliente suspendido.');
            },
            error: (error: HttpErrorResponse) => this.showError(
                error.error?.message ?? 'No se pudo cambiar el estado del cliente.',
            ),
        });
    }

    deleteDonation(donation: AdminDonationRow): void {
        if (!window.confirm(`¿Eliminar la donación "${donation.title}"?`)) {
            return;
        }

        this.donationService.deleteDonation(donation.id).subscribe({
            next: async () => {
                await this.loadDonations();
                this.showNotice('Donación eliminada.');
            },
            error: (error: HttpErrorResponse) => this.showError(
                error.error?.message ?? 'No se pudo eliminar la donación.',
            ),
        });
    }

    updateDonation(id: number, status: Extract<ApiDonationStatus, 'APPROVED' | 'REJECTED'>): void {
        let rejectionReason: string | null = null;

        if (status === 'REJECTED') {
            const reason = window.prompt('Motivo del rechazo (opcional):', '');
            if (reason === null) {
                return;
            }
            rejectionReason = reason.trim() || null;
        }

        this.donationService.updateStatus(id, { status, rejectionReason }).subscribe({
            next: async () => {
                await this.loadDonations();
                this.showNotice(
                    status === 'APPROVED' ? 'Donación aprobada.' : 'Donación rechazada.',
                );
            },
            error: () => this.showError('No se pudo actualizar la donación.'),
        });
    }

    markLoanReturned(id: number): void {
        this.loanService.returnLoan(id).subscribe({
            next: async () => {
                await this.loadLoans();
                this.showNotice('Préstamo marcado como devuelto.');
            },
            error: () => this.showError('No se pudo marcar el préstamo como devuelto.'),
        });
    }

    get title(): string {
        return ({ dashboard: 'Dashboard', books: 'Catálogo de libros', clients: 'Gestión de clientes', loans: 'Gestión de préstamos', donations: 'Gestión de donaciones' } as Record<AdminSection, string>)[this.section];
    }

    get breadcrumb(): string { return this.section === 'dashboard' ? 'Dashboard' : this.title.replace('Gestión de ', ''); }

    private handleFormError(error: HttpErrorResponse): void {
        this.isSubmitting.set(false);
        this.formError.set(
            error.error?.message
                ?? (error.status === 409
                    ? 'Ya existe un registro con esos datos.'
                    : 'No se pudo guardar. Revisa los datos e intenta de nuevo.'),
        );
    }

    private toBookRow(book: ApiBook): AdminBookRow {
        const status = book.bookStatus ? BOOK_STATUS_LABELS[toFrontStatus(book.bookStatus)] : 'Sin estado';
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            year: book.publishedDate?.slice(0, 4) ?? 'Sin año',
            category: book.category?.length
                ? book.category.map((category) => API_CATEGORY_LABELS[category] ?? category).join(', ')
                : 'Sin categoría',
            isbn: book.ISBN ?? 'Sin ISBN',
            pages: book.pages ? String(book.pages) : '—',
            status,
            origin: book.bookOrigin ? BOOK_ORIGIN_LABELS[toFrontOrigin(book.bookOrigin)] : 'Sin origen',
        };
    }

    private toClientRow(user: ApiUser): AdminClientRow {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            role: user.roles === 'ADMIN' ? 'Administrador' : 'Cliente',
            state: user.state ? 'ACTIVO' : 'INACTIVO',
        };
    }

    private toLoanRow(loan: ApiLoan): AdminLoanRow {
        const statuses = { ACTIVE: 'ACTIVO', OVERDUE: 'VENCIDO', RETURNED: 'DEVUELTO' } as const;
        return {
            id: loan.id,
            userEmail: loan.userEmail,
            bookTitle: loan.bookTitle,
            loanDate: loan.loanDate,
            dueDate: loan.dueDate,
            returnedDate: loan.returnedDate ?? '—',
            status: statuses[loan.status],
        };
    }

    private toDonationRow(donation: ApiDonation): AdminDonationRow {
        return {
            id: donation.id,
            title: donation.title,
            author: donation.author,
            donor: donation.donorName,
            donorEmail: donation.donorEmail,
            category: API_CATEGORY_LABELS[donation.category] ?? donation.category,
            condition: BOOK_CONDITION_LABELS[donation.condition] ?? donation.condition,
            date: donation.createdAt?.slice(0, 10) ?? '—',
            status: DONATION_STATUS_LABELS[donation.status] ?? donation.status,
            isbn: donation.ISBN?.trim() || 'Sin ISBN',
            notes: donation.notes?.trim() || '',
            rejectionReason: donation.rejectionReason?.trim() || '',
        };
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 2500);
    }

    private showError(message: string): void {
        this.error.set(message);
        setTimeout(() => this.error.set(''), 3000);
    }
}
