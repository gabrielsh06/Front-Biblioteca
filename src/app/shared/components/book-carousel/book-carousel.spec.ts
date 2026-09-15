import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCarousel } from './book-carousel';

describe('BookCarousel', () => {
    let component: BookCarousel;
    let fixture: ComponentFixture<BookCarousel>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BookCarousel],
        }).compileComponents();

        fixture = TestBed.createComponent(BookCarousel);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
