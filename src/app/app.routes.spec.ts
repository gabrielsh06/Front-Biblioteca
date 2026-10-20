import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { BookResponse, PageResponse } from './shared/models/book.model';
import { UserResponse } from './shared/models/user.model';

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

const MOCK_PAGE: PageResponse<BookResponse> = {
    content: [MOCK_BOOK],
    page: 0,
    size: 12,
    totalElements: 1,
    totalPages: 1,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
};

const MOCK_USER: UserResponse = {
    id: 1,
    firstName: 'Ada',
    lastName: 'Lovelace',
    roles: 'ADMIN',
    email: 'ada@example.com',
    state: true,
};

describe('App routing smoke test', () => {
    let fixture: ComponentFixture<App>;
    let router: Router;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(App);
        router = TestBed.inject(Router);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    async function navigateAndFlush(url: string): Promise<void> {
        await router.navigateByUrl(url);

        for (let attempt = 0; attempt < 5; attempt++) {
            await fixture.whenStable();
            fixture.detectChanges();

            const requests = httpMock.match(() => true);
            if (requests.length === 0) {
                break;
            }

            for (const request of requests) {
                if (request.request.url.includes('/api/users')) {
                    request.flush([MOCK_USER]);
                } else if (/\/api\/books\/\d+$/.test(request.request.url)) {
                    request.flush(MOCK_BOOK);
                } else {
                    request.flush(MOCK_PAGE);
                }
            }
        }

        await fixture.whenStable();
        fixture.detectChanges();
    }

    it('renders the home page', async () => {
        await navigateAndFlush('/');
        expect(fixture.nativeElement.textContent).toContain('El saber');
    });

    it('renders the catalog page', async () => {
        await navigateAndFlush('/catalogo');
        expect(fixture.nativeElement.textContent).toContain('Catálogo de la biblioteca');
    });

    it('renders the book detail page', async () => {
        await navigateAndFlush('/books/1');
        expect(fixture.nativeElement.textContent).toContain('Cien años de soledad');
    });

    it('renders the login page', async () => {
        await navigateAndFlush('/login');
        expect(fixture.nativeElement.textContent).toContain('Iniciar sesión');
    });

    it('renders the admin panel', async () => {
        await navigateAndFlush('/admin/libros');
        expect(fixture.nativeElement.textContent).toContain('Catálogo de libros');
    });
});
