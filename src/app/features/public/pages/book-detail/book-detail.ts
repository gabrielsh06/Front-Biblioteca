import { Component, input, output, computed, signal, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book, BOOK_STATUS_LABELS, BOOK_ORIGIN_LABELS } from '../../../../shared/models/book.model';

@Component({
    selector: 'app-book-detail',
    imports: [RouterModule, CommonModule],
    templateUrl: './book-detail.html',
    styleUrl: './book-detail.scss',
})
export class BookDetail {
    private location = inject(Location);

    book = input.required<Book>();
    reserve = output<string>();
    toggleFavoriteEvent = output<string>();

    isFavorite = signal<boolean>(false);

    isAvailable = computed(() => this.book().status === 'available');

    statusText = computed(() => BOOK_STATUS_LABELS[this.book().status] ?? this.book().status);

    originText = computed(() => {
        const origin = this.book().origin;
        return origin ? (BOOK_ORIGIN_LABELS[origin] ?? origin) : 'Fondo de la Biblioteca';
    });

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
