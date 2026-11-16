import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ApiDonation,
    ApiDonationCreateRequest,
    ApiDonationStatus,
    ApiDonationStatusRequest,
} from '../models/api.model';
import { API_BASE_URL } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class DonationService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_BASE_URL}/api`;

    createDonation(donation: ApiDonationCreateRequest): Observable<ApiDonation> {
        return this.http.post<ApiDonation>(`${this.baseUrl}/donations`, donation);
    }

    getAll(status?: ApiDonationStatus): Observable<ApiDonation[]> {
        let params = new HttpParams();

        if (status) {
            params = params.set('status', status);
        }

        return this.http.get<ApiDonation[]>(`${this.baseUrl}/admin/donations`, { params });
    }

    getById(id: number): Observable<ApiDonation> {
        return this.http.get<ApiDonation>(`${this.baseUrl}/admin/donations/${id}`);
    }

    updateStatus(
        id: number,
        request: ApiDonationStatusRequest,
    ): Observable<ApiDonation> {
        return this.http.put<ApiDonation>(
            `${this.baseUrl}/admin/donations/${id}/status`,
            request,
        );
    }

    deleteDonation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/admin/donations/${id}`);
    }
}
