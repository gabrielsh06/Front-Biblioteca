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
