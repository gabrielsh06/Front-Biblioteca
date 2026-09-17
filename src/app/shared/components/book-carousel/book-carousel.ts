import { Component, input, output, ElementRef, viewChild, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BookCard } from '../book-card/book-card';
import { Book } from '../../models/book.model';

@Component({
    selector: 'app-book-carousel',
    standalone: true,
    imports: [BookCard],
    templateUrl: './book-carousel.html',
    styleUrl: './book-carousel.scss'
})
export class BookCarousel implements OnInit, OnDestroy {
    private platformId = inject(PLATFORM_ID);
    private autoplayInterval: any;

    title = input<string>('Libros recomendados');
    books = input<Book[]>([]);
    reserveEvent = output<string>();

    track = viewChild<ElementRef<HTMLElement>>('track');

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoplay();
        }
    }

    ngOnDestroy(): void {
        this.stopAutoplay();
    }

    private getScrollAmount(): number {
        const element = this.track()?.nativeElement;
        const firstItem = element?.querySelector<HTMLElement>('.book-carousel__item');

        if (!element || !firstItem) {
            return 0;
        }

        const styles = getComputedStyle(element);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;

        return firstItem.offsetWidth + gap;
    }

    scrollLeft(): void {
        this.track()?.nativeElement.scrollBy({
            left: -this.getScrollAmount(),
            behavior: 'smooth',
        });
    }

    scrollRight(): void {
        this.track()?.nativeElement.scrollBy({
            left: this.getScrollAmount(),
            behavior: 'smooth',
        });
    }

    onReserve(bookId: string): void {
        this.reserveEvent.emit(bookId);
    }

    startAutoplay(): void {
        this.autoplayInterval = setInterval(() => {
            const el = this.track()?.nativeElement;
            if (el) {
                const isEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
                if (isEnd) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: this.getScrollAmount(), behavior: 'smooth' });
                }
            }
        }, 4000);
    }

    stopAutoplay(): void {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}
