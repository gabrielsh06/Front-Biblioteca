import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginCredentials } from '../../../../shared/models/user.model';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private readonly fb = new FormBuilder();
    private readonly router = inject(Router);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    readonly isPasswordVisible = signal(false);
    readonly isSubmitting = signal(false);

    togglePasswordVisibility(): void {
        this.isPasswordVisible.update((visible) => !visible);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const credentials: LoginCredentials = this.form.getRawValue();

        // TODO: reemplazar por la llamada real al servicio de autenticación
        // cuando exista el backend/endpoint de login. Mientras tanto, se simula
        // el rol a partir del correo: si contiene "admin", va al panel de admin;
        // si no, va al sitio público (hasta que exista la vista de "perfil").
        this.isSubmitting.set(true);
        console.log('Login enviado:', credentials);

        setTimeout(() => {
            this.isSubmitting.set(false);
            const isAdmin = credentials.email.toLowerCase().includes('admin');
            this.router.navigateByUrl(isAdmin ? '/admin' : '/');
        }, 600);
    }
}
