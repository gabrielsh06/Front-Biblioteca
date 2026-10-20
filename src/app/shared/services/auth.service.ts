import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials } from '../models/user.model';

const API_URL = 'https://back-biblioteca-ytgd.onrender.com/api';
const AUTH_STORAGE_KEY = 'biblioteca_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${API_URL}/auth/login`, credentials)
            .pipe(tap((auth) => localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))));
    }

    getCurrentAuth(): AuthResponse | null {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!storedAuth) {
            return null;
        }

        try {
            return JSON.parse(storedAuth) as AuthResponse;
        } catch {
            this.logout();
            return null;
        }
    }

    isAdmin(): boolean {
        return this.getCurrentAuth()?.role === 'ADMIN';
    }

    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
}
