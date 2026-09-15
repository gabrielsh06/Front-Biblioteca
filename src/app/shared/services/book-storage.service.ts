import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
    providedIn: 'root',
})
export class BookStorageService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly http = inject(HttpClient);
    private readonly storageKey = 'biblioteca-books';
    private initialization?: Promise<Book[]>;

    async loadBooks(): Promise<Book[]> {
        if (!this.isBrowser()) {
            return [];
        }

        if (!this.initialization) {
            this.initialization = this.initializeBooks();
        }

        return this.initialization;
    }

    getBooks(): Book[] {
        if (!this.isBrowser()) {
            return [];
        }

        const storedBooks = localStorage.getItem(this.storageKey);

        if (!storedBooks) {
            return [];
        }

        try {
            const books: unknown = JSON.parse(storedBooks);

            if (!Array.isArray(books)) {
                throw new Error('El contenido almacenado no es una lista de libros.');
            }

            const normalizedBooks = (books as Book[]).map((book) => this.normalizeBook(book));
            this.saveBooks(normalizedBooks);
            return normalizedBooks;
        } catch (error) {
            console.error('No se pudieron leer los libros del almacenamiento local.', error);
            return [];
        }
    }

    getBookById(id: string): Book | undefined {
        return this.getBooks().find((book) => book.id === id);
    }

    saveBooks(books: Book[]): void {
        if (!this.isBrowser()) {
            return;
        }

        localStorage.setItem(this.storageKey, JSON.stringify(books));
        this.initialization = Promise.resolve(books);
    }

    saveBook(book: Book): void {
        const books = this.getBooks();
        const bookIndex = books.findIndex((storedBook) => storedBook.id === book.id);

        if (bookIndex === -1) {
            this.saveBooks([...books, book]);
            return;
        }

        const updatedBooks = [...books];
        updatedBooks[bookIndex] = book;
        this.saveBooks(updatedBooks);
    }

    removeBook(id: string): void {
        this.saveBooks(this.getBooks().filter((book) => book.id !== id));
    }

    clearBooks(): void {
        if (!this.isBrowser()) {
            return;
        }

        localStorage.removeItem(this.storageKey);
        this.initialization = undefined;
    }

    private async initializeBooks(): Promise<Book[]> {
        const storedBooks = this.getBooks();

        if (storedBooks.length > 0) {
            return storedBooks;
        }

        const initialBooks = await firstValueFrom(this.http.get<Book[]>('/data/books.json'));
        const normalizedBooks = initialBooks.map((book) => this.normalizeBook(book));
        this.saveBooks(normalizedBooks);
        return normalizedBooks;
    }

    private normalizeBook(book: Book): Book {
        return {
            ...book,
            coverUrl: book.coverUrl?.replace(
                'covers.openlibrary.org/isbn/',
                'covers.openlibrary.org/b/isbn/',
            ),
        };
    }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }
}
