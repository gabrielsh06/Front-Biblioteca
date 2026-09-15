import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookCard } from '../../../../shared/components/book-card/book-card';
import {
    Book,
    BOOK_ORIGIN_LABELS,
    BOOK_STATUS_LABELS,
    PARENT_CATEGORIES,
} from '../../../../shared/models/book.model';
import { BookStorageService } from '../../../../shared/services/book-storage.service';

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
    private readonly bookStorage = inject(BookStorageService);

    readonly books = signal<Book[]>([]);
    readonly filteredBooks = signal<Book[]>([]);
    readonly visibleBooks = computed(() => this.filteredBooks().slice(0, 12));
    readonly isFilterOpen = signal(false);
    readonly categories = PARENT_CATEGORIES;
    readonly statuses = Object.entries(BOOK_STATUS_LABELS) as [Book['status'], string][];
    readonly origins = Object.entries(BOOK_ORIGIN_LABELS) as [
        NonNullable<Book['origin']>,
        string,
    ][];
    readonly sort = signal<SortOption>('relevance');
    readonly selectedCategory = signal('');
    readonly selectedStatus = signal('');
    readonly selectedOrigin = signal('');

    constructor() {
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            this.selectedCategory.set(params.get('categoria') ?? params.get('category') ?? '');
            this.selectedStatus.set(params.get('disponibilidad') ?? '');
            this.selectedOrigin.set(params.get('origen') ?? '');
            this.sort.set((params.get('orden') as SortOption) || 'relevance');
            this.applyFilters();
        });

        void this.loadBooks();
    }

    private async loadBooks(): Promise<void> {
        const books = await this.bookStorage.loadBooks();
        this.books.set(books);
        this.applyFilters();
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

    closeFilters(): void {
        this.isFilterOpen.set(false);
    }

    private applyFilters(): void {
        const category = this.normalize(this.selectedCategory());
        const status = this.selectedStatus();
        const origin = this.selectedOrigin();
        const sortedBooks = this.books()
            .filter((book) => {
                const hasCategory =
                    !category || book.genres?.some((genre) => this.normalize(genre) === category);
                const hasStatus = !status || book.status === status;
                const hasOrigin = !origin || book.origin === origin;
                return hasCategory && hasStatus && hasOrigin;
            })
            .sort((first, second) => this.compareBooks(first, second));

        this.filteredBooks.set(sortedBooks);
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
}
