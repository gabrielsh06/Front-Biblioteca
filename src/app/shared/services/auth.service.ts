import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiAuthResponse, ApiMessageResponse, ApiRole, ApiUserCreateRequest } from '../models/api.model';
import { LoginCredentials } from '../models/user.model';
import { API_BASE_URL } from './api-config';

export interface AuthSession {
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    role: ApiRole;
}

export const AUTH_STORAGE_KEY = 'biblioteca-auth';

function readStoredSession(): AuthSession | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored) as AuthSession;
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function readStoredToken(): string | null {
    return readStoredSession()?.token ?? null;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${API_BASE_URL}/api/auth`;
    private readonly session = signal<AuthSession | null>(readStoredSession());

    readonly currentUser = this.session.asReadonly();
    readonly isAuthenticated = computed(() => this.session() !== null);
    readonly isAdmin = computed(() => this.session()?.role === 'ADMIN');
    readonly displayName = computed(() => {
        const session = this.session();
        return session ? `${session.firstName} ${session.lastName}`.trim() : '';
    });

    login(credentials: LoginCredentials): Observable<AuthSession> {
        return this.http
            .post<ApiAuthResponse>(`${this.baseUrl}/login`, credentials)
            .pipe(tap((response) => this.saveSession(response)));
    }

    register(data: ApiUserCreateRequest): Observable<AuthSession> {
        return this.http
            .post<ApiAuthResponse>(`${this.baseUrl}/register`, data)
            .pipe(tap((response) => this.saveSession(response)));
    }

    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        this.session.set(null);
    }

    forgotPassword(email: string): Observable<ApiMessageResponse> {
        return this.http.post<ApiMessageResponse>(`${this.baseUrl}/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<ApiMessageResponse> {
        return this.http.post<ApiMessageResponse>(`${this.baseUrl}/reset-password`, {
            token,
            newPassword,
        });
    }

    getToken(): string | null {
        return this.session()?.token ?? null;
    }

    private saveSession(response: ApiAuthResponse): AuthSession {
        const session: AuthSession = {
            token: response.token,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role,
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        this.session.set(session);
        return session;
    }
}
