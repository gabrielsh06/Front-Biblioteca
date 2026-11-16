import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUser, ApiUserCreateRequest, ApiUserUpdateRequest } from '../models/api.model';
import { API_BASE_URL } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_BASE_URL}/api/users`;

    getAllUsers(): Observable<ApiUser[]> {
        return this.http.get<ApiUser[]>(this.baseUrl);
    }

    getUser(id: number): Observable<ApiUser> {
        return this.http.get<ApiUser>(`${this.baseUrl}/${id}`);
    }

    registerUser(user: ApiUserCreateRequest): Observable<ApiUser> {
        return this.http.post<ApiUser>(this.baseUrl, user);
    }

    updateUser(id: number, user: ApiUserUpdateRequest): Observable<ApiUser> {
        return this.http.put<ApiUser>(`${this.baseUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
