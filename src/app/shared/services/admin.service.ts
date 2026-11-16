import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiAdminDashboard } from '../models/api.model';
import { API_BASE_URL } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private readonly http = inject(HttpClient);

    getDashboard(): Observable<ApiAdminDashboard> {
        return this.http.get<ApiAdminDashboard>(`${API_BASE_URL}/api/admin/dashboard`);
    }
}
