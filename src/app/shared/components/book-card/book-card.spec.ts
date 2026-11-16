import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BookCard } from './book-card';

describe('BookCard', () => {
    let component: BookCard;
    let fixture: ComponentFixture<BookCard>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
            imports: [BookCard],
        }).compileComponents();

        fixture = TestBed.createComponent(BookCard);
        fixture.componentRef.setInput('book', {
            id: '1',
            title: 'Libro de prueba',
            author: 'Autor de prueba',
            status: 'available',
        });
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
