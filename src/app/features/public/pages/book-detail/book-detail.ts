import { Component, computed, signal, inject, DestroyRef } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { toBook } from '../../../../shared/mappers/book.mapper';
import { Book, BOOK_STATUS_LABELS, BOOK_ORIGIN_LABELS } from '../../../../shared/models/book.model';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { AuthService } from '../../../../shared/services/auth.service';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { LoanService } from '../../../../shared/services/loan.service';

@Component({
    selector: 'app-book-detail',
    imports: [RouterModule, CommonModule, BookCarousel],
    templateUrl: './book-detail.html',
    styleUrl: './book-detail.scss',
})
export class BookDetail {
    private location = inject(Location);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private bookApi = inject(BookApiService);
    private loanService = inject(LoanService);
    private auth = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    book = signal<Book>({
        id: '',
        title: '',
        author: '',
        status: 'unavailable',
    });
    authorBooks = signal<Book[]>([]);
    relatedBooks = signal<Book[]>([]);
    isLoading = signal(true);
    error = signal('');
    notice = signal('');

    isFavorite = signal<boolean>(false);

    isAvailable = computed(() => this.book().status === 'available');

    statusText = computed(() => BOOK_STATUS_LABELS[this.book().status] ?? this.book().status);

    originText = computed(() => {
        const origin = this.book().origin;
        return origin ? (BOOK_ORIGIN_LABELS[origin] ?? origin) : 'Fondo de la Biblioteca';
    });

    constructor() {
        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                const bookId = params.get('id');

                if (bookId) {
                    void this.loadBook(bookId);
                }
            });
    }

    private async loadBook(bookId: string): Promise<void> {
        this.isLoading.set(true);
        this.error.set('');

        try {
            const apiBook = await firstValueFrom(this.bookApi.getBook(Number(bookId)));
            const selectedBook = toBook(apiBook);
            this.book.set(selectedBook);
            this.authorBooks.set([]);
            this.relatedBooks.set([]);
            this.isFavorite.set(false);

            const [authorPage, relatedPage] = await Promise.allSettled([
                firstValueFrom(this.bookApi.getBooks({ search: selectedBook.author, size: 12 })),
                apiBook.category?.length
                    ? firstValueFrom(this.bookApi.getBooks({ category: apiBook.category[0], size: 12 }))
                    : Promise.resolve(null),
            ]);

            this.authorBooks.set(
                authorPage.status === 'fulfilled'
                    ? authorPage.value.content
                        .map(toBook)
                        .filter((book) => book.id !== selectedBook.id && book.author === selectedBook.author)
                    : [],
            );

            this.relatedBooks.set(
                relatedPage.status === 'fulfilled' && relatedPage.value
                    ? relatedPage.value.content
                        .map(toBook)
                        .filter((book) =>
                            book.id !== selectedBook.id &&
                            book.genres?.some((genre) => selectedBook.genres?.includes(genre)),
                        )
                    : [],
            );
        } catch {
            this.error.set('No encontramos este libro en el catálogo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onBack(): void {
        this.location.back();
    }

    onCoverError(event: Event): void {
        const image = event.target as HTMLImageElement;
        image.src = '/cover-placeholder.svg';
    }

    onFavoriteClick(): void {
        this.isFavorite.update((prev) => !prev);
    }

    onReserveClick(): void {
        if (!this.isAvailable()) {
            return;
        }

        this.reserve(Number(this.book().id));
    }

    onReserve(bookId: string): void {
        this.reserve(Number(bookId));
    }

    private reserve(bookId: number): void {
        if (!this.auth.isAuthenticated()) {
            void this.router.navigate(['/login']);
            return;
        }

        this.loanService.create(bookId).subscribe({
            next: () => this.showNotice('Préstamo registrado correctamente.'),
            error: () => this.showNotice('No se pudo registrar el préstamo.'),
        });
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 3000);
    }
}
