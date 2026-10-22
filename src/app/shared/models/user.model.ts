export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'ADMIN';
}
