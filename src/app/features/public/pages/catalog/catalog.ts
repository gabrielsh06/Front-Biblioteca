import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookCard } from '../../../../shared/components/book-card/book-card';
import { toBook } from '../../../../shared/mappers/book.mapper';
import { Book, BOOK_ORIGIN_LABELS, BOOK_STATUS_LABELS, PARENT_CATEGORIES } from '../../../../shared/models/book.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { LoanService } from '../../../../shared/services/loan.service';

type SortOption = 'relevance' | 'recent' | 'title' | 'author';

@Component({
    selector: 'app-catalog',
    imports: [RouterModule, BookCard],
    templateUrl: './catalog.html',
    styleUrl: './catalog.scss',
})
export class Catalog {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly bookApi = inject(BookApiService);
    private readonly loanService = inject(LoanService);
    private readonly auth = inject(AuthService);

    readonly books = signal<Book[]>([]);
    readonly filteredBooks = signal<Book[]>([]);
    readonly visibleCount = signal(12);
    readonly visibleBooks = computed(() => this.filteredBooks().slice(0, this.visibleCount()));
    readonly hasMore = computed(() => this.visibleCount() < this.filteredBooks().length);
    readonly isFilterOpen = signal(false);
    readonly isLoading = signal(true);
    readonly error = signal('');
    readonly notice = signal('');
    readonly categories = PARENT_CATEGORIES;
    readonly statuses = Object.entries(BOOK_STATUS_LABELS) as [Book['status'], string][];
    readonly origins = Object.entries(BOOK_ORIGIN_LABELS) as [NonNullable<Book['origin']>, string][];
    readonly sort = signal<SortOption>('relevance');
    readonly selectedSearch = signal('');
    readonly selectedCategory = signal('');
    readonly selectedStatus = signal('');
    readonly selectedOrigin = signal('');

    constructor() {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                this.selectedSearch.set(params.get('q') ?? params.get('buscar') ?? '');
                this.selectedCategory.set(params.get('categoria') ?? params.get('category') ?? '');
                this.selectedStatus.set(params.get('disponibilidad') ?? '');
                this.selectedOrigin.set(params.get('origen') ?? '');
                this.sort.set((params.get('orden') as SortOption) || 'relevance');
                this.applyFilters();
            });

        void this.loadBooks();
    }

    updateFilter(name: 'categoria' | 'disponibilidad' | 'origen' | 'orden', value: string): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { [name]: value || null },
            queryParamsHandling: 'merge',
        });
    }

    clearFilters(): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                q: null,
                buscar: null,
                categoria: null,
                category: null,
                disponibilidad: null,
                origen: null,
                orden: null,
            },
        });
    }

    toggleFilters(): void {
        this.isFilterOpen.update((open) => !open);
    }

    loadMore(): void {
        this.visibleCount.update((count) => count + 12);
    }

    closeFilters(): void {
        this.isFilterOpen.set(false);
    }

    onReserve(bookId: string): void {
        if (!this.auth.isAuthenticated()) {
            void this.router.navigate(['/login']);
            return;
        }

        this.loanService.create(Number(bookId)).subscribe({
            next: () => this.showNotice('Préstamo registrado correctamente.'),
            error: () => this.showNotice('No se pudo registrar el préstamo.'),
        });
    }

    private async loadBooks(): Promise<void> {
        try {
            const page = await firstValueFrom(this.bookApi.getBooks({ size: 200 }));
            this.books.set(page.content.map(toBook));
        } catch {
            this.error.set('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
        } finally {
            this.isLoading.set(false);
            this.applyFilters();
        }
    }

    private applyFilters(): void {
        const search = this.normalize(this.selectedSearch());
        const category = this.normalize(this.selectedCategory());
        const status = this.selectedStatus();
        const origin = this.selectedOrigin();
        const sortedBooks = this.books()
            .filter((book) => {
                const matchesSearch = !search || [book.title, book.author, book.isbn, ...(book.genres ?? [])]
                    .filter(Boolean)
                    .some((value) => this.normalize(String(value)).includes(search));
                const hasCategory = !category || book.genres?.some((genre) =>
                    this.normalizeCategory(genre) === category,
                );
                const hasStatus = !status || book.status === status;
                const hasOrigin = !origin || book.origin === origin;
                return matchesSearch && hasCategory && hasStatus && hasOrigin;
            })
            .sort((first, second) => this.compareBooks(first, second));

        this.filteredBooks.set(sortedBooks);
        this.visibleCount.set(12);
    }

    private compareBooks(first: Book, second: Book): number {
        switch (this.sort()) {
            case 'recent':
                return (second.publishedYear ?? 0) - (first.publishedYear ?? 0);
            case 'title':
                return first.title.localeCompare(second.title);
            case 'author':
                return first.author.localeCompare(second.author);
            default:
                return (second.likesCount ?? 0) - (first.likesCount ?? 0);
        }
    }

    private normalize(value: string): string {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/-/g, ' ')
            .trim();
    }

    private normalizeCategory(value: string): string {
        const category = this.categories.find((item) =>
            this.normalize(item.slug) === this.normalize(value)
            || this.normalize(item.label) === this.normalize(value),
        );

        return category ? this.normalize(category.slug) : this.normalize(value);
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 3000);
    }
}
