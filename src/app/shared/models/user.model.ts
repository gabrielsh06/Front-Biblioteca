export interface User {
    id: string;
    fullName: string;
    email: string;
    role: 'reader' | 'admin';
}

// Datos que envía el formulario de login (PROJ-13 - Agregar componente login).
export interface LoginCredentials {
    email: string;
    password: string;
}
export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  roles: UserRole;
  email: string;
  state: boolean;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  role?: UserRole;
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}