import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BookCategory,
    BookOrigin,
    BookResponse,
    BookStatus,
} from '../../../../shared/models/book.model';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { BookService } from '../../../../shared/services/book.service';

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    AVAILABLE: 'Disponible',
    CHECKED_OUT: 'Prestado',
    UNAVAILABLE: 'No disponible',
    IN_LIBRARY: 'Solo en sala',
};

const BOOK_ORIGIN_LABELS: Record<BookOrigin, string> = {
    LIBRARY_FUND: 'Fondo de la Biblioteca',
    COMMUNITY_DONATION: 'Donación comunitaria',
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

const EMPTY_BOOK: BookResponse = {
    id: 0,
    title: '',
    author: '',
    bookStatus: 'UNAVAILABLE',
    bookOrigin: 'LIBRARY_FUND',
    likesCount: 0,
    coverUrl: '',
    ISBN: '',
    stock: 0,
    category: [],
    active: true,
};

@Component({
    selector: 'app-book-detail',
    imports: [RouterModule, CommonModule, BookCarousel],
    templateUrl: './book-detail.html',
    styleUrl: './book-detail.scss',
})
export class BookDetail {
    private readonly location = inject(Location);
    private readonly route = inject(ActivatedRoute);
    private readonly bookService = inject(BookService);
    private readonly destroyRef = inject(DestroyRef);

    readonly book = signal<BookResponse>(EMPTY_BOOK);
    readonly authorBooks = signal<BookResponse[]>([]);
    readonly relatedBooks = signal<BookResponse[]>([]);
    readonly isLoading = signal(false);

    readonly reserve = output<number>();
    readonly toggleFavoriteEvent = output<number>();
    readonly isFavorite = signal(false);

    readonly isAvailable = computed(
        () => this.book().bookStatus === 'AVAILABLE' && this.book().stock > 0,
    );
    readonly statusText = computed(() => BOOK_STATUS_LABELS[this.book().bookStatus]);
    readonly originText = computed(() => BOOK_ORIGIN_LABELS[this.book().bookOrigin]);
    readonly categoriesText = computed(() =>
        this.book().category.map((category) => CATEGORY_LABELS[category]).join(', '),
    );

    constructor() {
        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                const bookId = Number(params.get('id'));

                if (Number.isFinite(bookId) && bookId > 0) {
                    this.loadBook(bookId);
                } else {
                    this.location.back();
                }
            });
    }

    onBack(): void {
        this.location.back();
    }

    onFavoriteClick(): void {
        this.isFavorite.update((previous) => !previous);
        this.toggleFavoriteEvent.emit(this.book().id);
    }

    onReserveClick(): void {
        if (this.isAvailable()) {
            this.reserve.emit(this.book().id);
        }
    }

    private loadBook(bookId: number): void {
        this.isLoading.set(true);
        this.bookService.getBookById(bookId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (book) => {
                    this.book.set(book);
                    this.isFavorite.set(false);
                    this.isLoading.set(false);
                    this.loadSuggestions(book);
                },
                error: () => {
                    this.isLoading.set(false);
                    this.location.back();
                },
            });
    }

    private loadSuggestions(book: BookResponse): void {
        this.bookService.getBooks({ search: book.author, size: 12 })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.authorBooks.set(
                        response.content.filter(
                            (item) => item.id !== book.id && item.author === book.author,
                        ),
                    );
                },
                error: () => this.authorBooks.set([]),
            });

        this.bookService.getBooks({ size: 40 })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.relatedBooks.set(
                        response.content
                            .filter(
                                (item) =>
                                    item.id !== book.id &&
                                    item.category.some((category) => book.category.includes(category)),
                            )
                            .slice(0, 12),
                    );
                },
                error: () => this.relatedBooks.set([]),
            });
    }
}
