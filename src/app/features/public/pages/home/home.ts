import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { BookCategory, BookResponse } from '../../../../shared/models/book.model';
import { BookService } from '../../../../shared/services/book.service';

interface PublicCategory {
    slug: BookCategory;
    label: string;
}

@Component({
    selector: 'app-home',
    imports: [RouterModule, BookCarousel],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    private readonly bookService = inject(BookService);
    private readonly destroyRef = inject(DestroyRef);

    readonly categories: PublicCategory[] = [
        { slug: 'FICTION', label: 'Ficción' },
        { slug: 'NON_FICTION', label: 'No ficción' },
        { slug: 'POETRY', label: 'Poesía' },
        { slug: 'SCIENCE_FICTION', label: 'Ciencia ficción' },
        { slug: 'CHILDREN', label: 'Infantil' },
        { slug: 'PERSONAL_DEVELOPMENT', label: 'Desarrollo personal' },
    ];
    readonly recommendedBooks = signal<BookResponse[]>([]);
    readonly popularBooks = signal<BookResponse[]>([]);

    constructor() {
        forkJoin({
            recommended: this.bookService.getBooks({ size: 12 }),
            popular: this.bookService.getBooks({ size: 12, sort: ['likesCount,desc'] }),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: ({ recommended, popular }) => {
                    this.recommendedBooks.set(recommended.content);
                    this.popularBooks.set(popular.content);
                },
                error: () => {
                    this.recommendedBooks.set([]);
                    this.popularBooks.set([]);
                },
            });
    }
}
