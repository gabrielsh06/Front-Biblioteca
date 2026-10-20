import { Component, input, output, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookResponse, BookStatus } from '../../models/book.model';

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    AVAILABLE: 'Disponible',
    CHECKED_OUT: 'Prestado',
    UNAVAILABLE: 'No disponible',
    IN_LIBRARY: 'Solo en sala',
};

const BOOK_STATUS_CLASSES: Record<BookStatus, string> = {
    AVAILABLE: 'available',
    CHECKED_OUT: 'checked-out',
    UNAVAILABLE: 'unavailable',
    IN_LIBRARY: 'in-library',
};

const BOOK_ACTION_LABELS: Record<BookStatus, string> = {
    AVAILABLE: 'Reservar',
    CHECKED_OUT: 'Prestado',
    UNAVAILABLE: 'No disponible',
    IN_LIBRARY: 'Solo en sala',
};

@Component({
    selector: 'app-book-card',
    imports: [RouterModule],
    templateUrl: './book-card.html',
    styleUrl: './book-card.scss',
})
export class BookCard {
    book = input.required<BookResponse>();
    reserve = output<number>();

    isReservable = computed(() => this.book().bookStatus === 'AVAILABLE');

    statusText = computed(() => BOOK_STATUS_LABELS[this.book().bookStatus]);

    statusClass = computed(() => BOOK_STATUS_CLASSES[this.book().bookStatus]);

    actionLabel = computed(() => BOOK_ACTION_LABELS[this.book().bookStatus]);

    onActionClick(event: MouseEvent): void {
        event.stopPropagation();
        if (this.isReservable()) {
            this.reserve.emit(this.book().id);
        }
    }
}
