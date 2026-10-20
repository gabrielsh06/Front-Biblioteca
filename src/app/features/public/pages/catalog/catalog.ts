import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookCard } from '../../../../shared/components/book-card/book-card';
import { BookCategory, BookResponse } from '../../../../shared/models/book.model';
import { BookService } from '../../../../shared/services/book.service';

type SortOption = 'relevance' | 'recent' | 'title' | 'author';

interface CategoryOption {
    slug: BookCategory;
    label: string;
}

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
    private readonly bookService = inject(BookService);
    private searchTimer?: ReturnType<typeof setTimeout>;

    readonly categories: CategoryOption[] = [
        { slug: 'FICTION', label: 'Ficción' },
        { slug: 'NON_FICTION', label: 'No ficción' },
        { slug: 'POETRY', label: 'Poesía' },
        { slug: 'SCIENCE_FICTION', label: 'Ciencia ficción' },
        { slug: 'CHILDREN', label: 'Infantil' },
        { slug: 'PERSONAL_DEVELOPMENT', label: 'Desarrollo personal' },
    ];
    readonly books = signal<BookResponse[]>([]);
    readonly isFilterOpen = signal(false);
    readonly isLoading = signal(false);
    readonly error = signal('');
    readonly sort = signal<SortOption>('relevance');
    readonly selectedCategory = signal<BookCategory | ''>('');
    readonly searchTerm = signal('');
    readonly page = signal(1);
    readonly totalElements = signal(0);
    readonly totalPages = signal(0);
    readonly hasPreviousPage = computed(() => this.page() > 1);
    readonly hasNextPage = computed(() => this.page() < this.totalPages());

    constructor() {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                this.searchTerm.set(params.get('search') ?? '');
                this.selectedCategory.set(this.toCategory(params.get('categoria') ?? params.get('category')));
                this.sort.set((params.get('orden') as SortOption) || 'relevance');
                this.page.set(Math.max(1, Number(params.get('page')) || 1));
                this.loadBooks();
            });

        this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
    }

    onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            void this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { search: value.trim() || null, page: null },
                queryParamsHandling: 'merge',
            });
        }, 350);
    }

    updateFilter(name: 'categoria' | 'orden', value: string): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { [name]: value || null, page: null },
            queryParamsHandling: 'merge',
        });
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages() || page === this.page()) {
            return;
        }

        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: page === 1 ? null : page },
            queryParamsHandling: 'merge',
        });
    }

    clearFilters(): void {
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                search: null,
                categoria: null,
                category: null,
                orden: null,
                page: null,
            },
        });
    }

    toggleFilters(): void {
        this.isFilterOpen.update((open) => !open);
    }

    closeFilters(): void {
        this.isFilterOpen.set(false);
    }

    private loadBooks(): void {
        this.isLoading.set(true);
        this.error.set('');

        this.bookService.getBooks({
            search: this.searchTerm() || undefined,
            category: this.selectedCategory() || undefined,
            page: this.page() - 1,
            size: 12,
            sort: [this.toSortParam(this.sort())],
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.books.set(response.content);
                    this.totalElements.set(response.totalElements);
                    this.totalPages.set(response.totalPages);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.books.set([]);
                    this.totalElements.set(0);
                    this.totalPages.set(0);
                    this.error.set('No se pudo cargar el catálogo. Intenta nuevamente.');
                    this.isLoading.set(false);
                },
            });
    }

    private toCategory(value: string | null): BookCategory | '' {
        return this.categories.some((category) => category.slug === value)
            ? (value as BookCategory)
            : '';
    }

    private toSortParam(sort: SortOption): string {
        const sortParams: Record<SortOption, string> = {
            relevance: 'likesCount,desc',
            recent: 'publishedDate,desc',
            title: 'title,asc',
            author: 'author,asc',
        };

        return sortParams[sort];
    }
}
