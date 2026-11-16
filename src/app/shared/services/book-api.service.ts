import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ApiBook,
    ApiBookLookup,
    ApiBookRequest,
    ApiCategory,
    ApiPage,
} from '../models/api.model';
import { API_BASE_URL } from './api-config';

export interface BookQuery {
    search?: string;
    category?: ApiCategory;
    page?: number;
    size?: number;
    sort?: string[];
}

@Injectable({
    providedIn: 'root',
})
export class BookApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_BASE_URL}/api/books`;

    getBooks(query: BookQuery = {}): Observable<ApiPage<ApiBook>> {
        let params = new HttpParams()
            .set('page', query.page ?? 0)
            .set('size', query.size ?? 100);

        if (query.search?.trim()) {
            params = params.set('search', query.search.trim());
        }

        if (query.category) {
            params = params.set('category', query.category);
        }

        for (const sort of query.sort ?? []) {
            params = params.append('sort', sort);
        }

        return this.http.get<ApiPage<ApiBook>>(this.baseUrl, { params });
    }

    getBook(id: number): Observable<ApiBook> {
        return this.http.get<ApiBook>(`${this.baseUrl}/${id}`);
    }

    registerBook(book: ApiBookRequest): Observable<ApiBook> {
        return this.http.post<ApiBook>(this.baseUrl, book);
    }

    updateBook(id: number, book: ApiBookRequest): Observable<ApiBook> {
        return this.http.put<ApiBook>(`${this.baseUrl}/${id}`, book);
    }

    deleteBook(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    lookupByIsbn(isbn: string): Observable<ApiBookLookup> {
        return this.http.get<ApiBookLookup>(`${this.baseUrl}/lookup/${encodeURIComponent(isbn)}`);
    }
}
