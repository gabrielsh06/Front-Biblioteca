import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { toBook } from '../../../../shared/mappers/book.mapper';
import { Book, PARENT_CATEGORIES } from '../../../../shared/models/book.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { LoanService } from '../../../../shared/services/loan.service';

@Component({
    selector: 'app-home',
    imports: [RouterModule, BookCarousel],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    private readonly bookApi = inject(BookApiService);
    private readonly loanService = inject(LoanService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly categories = PARENT_CATEGORIES;
    readonly recommendedBooks = signal<Book[]>([]);
    readonly popularBooks = signal<Book[]>([]);
    readonly notice = signal('');
    readonly error = signal('');

    constructor() {
        void this.loadBooks();
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
            const page = await firstValueFrom(this.bookApi.getBooks({ size: 48 }));
            const books = page.content.map(toBook);

            this.recommendedBooks.set(books.slice(0, 12));
            this.popularBooks.set(
                [...books]
                    .sort((first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0))
                    .slice(0, 12),
            );
        } catch {
            this.error.set('No se pudieron cargar los libros. Intenta de nuevo más tarde.');
        }
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 3000);
    }
}
