import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BookCard } from './book-card';
import { BookResponse } from '../../models/book.model';

const MOCK_BOOK: BookResponse = {
    id: 1,
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    bookStatus: 'AVAILABLE',
    bookOrigin: 'PURCHASED',
    likesCount: 10,
    coverUrl: 'https://example.com/cover.jpg',
    ISBN: '9780307474728',
    stock: 3,
    category: ['FICTION'],
    active: true,
};

describe('BookCard', () => {
    let component: BookCard;
    let fixture: ComponentFixture<BookCard>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BookCard],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(BookCard);
        fixture.componentRef.setInput('book', MOCK_BOOK);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
