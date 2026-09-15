import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookCarousel } from '../../../../shared/components/book-carousel/book-carousel';
import { Book, PARENT_CATEGORIES } from '../../../../shared/models/book.model';

@Component({
    selector: 'app-home',
    imports: [RouterModule, BookCarousel],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    readonly categories = PARENT_CATEGORIES;

    readonly recommendedBooks = input<Book[]>([]);
    readonly popularBooks = input<Book[]>([]);
}
