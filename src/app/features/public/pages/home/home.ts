import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { Book, PARENT_CATEGORIES } from '../../../../shared/models/book.model';
import { BookStorageService } from '../../../../shared/services/book-storage.service';

@Component({
    selector: 'app-home',
    imports: [RouterModule, BookCarousel],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    private readonly bookStorage = inject(BookStorageService);

    readonly categories = PARENT_CATEGORIES;
    readonly recommendedBooks = signal<Book[]>([]);
    readonly popularBooks = signal<Book[]>([]);

    constructor() {
        void this.loadBooks();
    }

    private async loadBooks(): Promise<void> {
        const books = await this.bookStorage.loadBooks();
        this.recommendedBooks.set(books.slice(0, 6));
        this.popularBooks.set(
            [...books]
                .sort((first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0))
                .slice(0, 6),
        );
    }
}
