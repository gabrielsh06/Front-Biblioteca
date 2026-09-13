import { Component, input, output, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Book, BOOK_STATUS_LABELS } from '../../models/book.model';

@Component({
    selector: 'app-book-card',
    imports: [RouterModule],
    templateUrl: './book-card.html',
    styleUrl: './book-card.scss',
})
export class BookCard {
    book = input.required<Book>();
    reserve = output<string>()

    isReservable = computed(() => this.book().status === 'available');

    statusText = computed(() => BOOK_STATUS_LABELS[this.book().status] ?? this.book().status);
    actionLabel = computed(() => {
        switch (this.book().status) {
            case 'available':
                return 'Reservar';
            case 'checked-out':
                return 'Prestado';
            case 'in-library':
                return 'Solo en sala';
            case 'unavailable':
            default:
                return 'No disponible';
        }
    });

    onActionClick(event: MouseEvent): void {
        event.stopPropagation();
        if (this.isReservable()) {
            this.reserve.emit(this.book().id);
        }
    }
}
