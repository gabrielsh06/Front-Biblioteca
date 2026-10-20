import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BookCreateRequest,
  BookLookupResponse,
  BookQueryParams,
  BookResponse,
  BookUpdateRequest,
  PageResponse
} from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://back-biblioteca-ytgd.onrender.com/api/books';

  getBooks(params: BookQueryParams = {}): Observable<PageResponse<BookResponse>> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 0).toString())
      .set('size', (params.size ?? 12).toString());

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.sort?.length) {
      params.sort.forEach((s) => (httpParams = httpParams.append('sort', s)));
    }

    return this.http.get<PageResponse<BookResponse>>(this.apiUrl, { params: httpParams });
  }

  getBookById(id: number): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.apiUrl}/${id}`);
  }

  createBook(book: BookCreateRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>(this.apiUrl, book);
  }

  updateBook(id: number, book: BookUpdateRequest): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  lookupByIsbn(isbn: string): Observable<BookLookupResponse> {
    return this.http.get<BookLookupResponse>(`${this.apiUrl}/lookup/${isbn}`);
  }
}