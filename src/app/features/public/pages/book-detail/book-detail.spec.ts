import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BookDetail } from './book-detail';

describe('BookDetail', () => {
    let component: BookDetail;
    let fixture: ComponentFixture<BookDetail>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
            imports: [BookDetail],
        }).compileComponents();

        fixture = TestBed.createComponent(BookDetail);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
