import { Component, output, computed, signal, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Book, BOOK_STATUS_LABELS, BOOK_ORIGIN_LABELS } from '../../../../shared/models/book.model';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { BookStorageService } from '../../../../shared/services/book-storage.service';

@Component({
    selector: 'app-book-detail',
    imports: [RouterModule, CommonModule, BookCarousel],
    templateUrl: './book-detail.html',
    styleUrl: './book-detail.scss',
})
export class BookDetail {
    private location = inject(Location);
    private route = inject(ActivatedRoute);
    private bookStorage = inject(BookStorageService);

    book = signal<Book>({
        id: '',
        title: '',
        author: '',
        status: 'unavailable',
    });
    authorBooks = signal<Book[]>([]);
    relatedBooks = signal<Book[]>([]);

    reserve = output<string>();
    toggleFavoriteEvent = output<string>();

    isFavorite = signal<boolean>(false);

    isAvailable = computed(() => this.book().status === 'available');

    statusText = computed(() => BOOK_STATUS_LABELS[this.book().status] ?? this.book().status);

    originText = computed(() => {
        const origin = this.book().origin;
        return origin ? (BOOK_ORIGIN_LABELS[origin] ?? origin) : 'Fondo de la Biblioteca';
    });

    constructor() {
        void this.loadBook();
    }

    private async loadBook(): Promise<void> {
        const books = await this.bookStorage.loadBooks();
        const bookId = this.route.snapshot.paramMap.get('id');
        const selectedBook = bookId ? books.find((book) => book.id === bookId) : undefined;

        if (!selectedBook) {
            this.location.back();
            return;
        }

        this.book.set(selectedBook);
        this.authorBooks.set(
            books.filter((book) => book.id !== selectedBook.id && book.author === selectedBook.author),
        );
        this.relatedBooks.set(
            books.filter((book) =>
                book.id !== selectedBook.id &&
                book.genres?.some((genre) => selectedBook.genres?.includes(genre)),
            ),
        );
    }

    onBack(): void {
        this.location.back();
    }

    onFavoriteClick(): void {
        this.isFavorite.update((prev) => !prev);
        this.toggleFavoriteEvent.emit(this.book().id);
    }

    onReserveClick(): void {
        if (this.isAvailable()) {
            this.reserve.emit(this.book().id);
        }
    }
}
