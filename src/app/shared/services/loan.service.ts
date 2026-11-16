import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiLoan } from '../models/api.model';
import { API_BASE_URL } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class LoanService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_BASE_URL}/api`;

    create(bookId: number): Observable<ApiLoan> {
        return this.http.post<ApiLoan>(`${this.baseUrl}/loans`, { bookId });
    }

    myLoans(): Observable<ApiLoan[]> {
        return this.http.get<ApiLoan[]>(`${this.baseUrl}/loans/my-loans`);
    }

    returnLoan(id: number): Observable<ApiLoan> {
        return this.http.put<ApiLoan>(`${this.baseUrl}/loans/${id}/return`, null);
    }

    allLoans(): Observable<ApiLoan[]> {
        return this.http.get<ApiLoan[]>(`${this.baseUrl}/admin/loans`);
    }

    overdueLoans(): Observable<ApiLoan[]> {
        return this.http.get<ApiLoan[]>(`${this.baseUrl}/admin/loans/overdue`);
    }
}
