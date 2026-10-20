import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    readonly mode = signal<AuthMode>('login');
    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
    readonly registerForm = this.fb.nonNullable.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    readonly isPasswordVisible = signal(false);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal('');

    togglePasswordVisibility(): void {
        this.isPasswordVisible.update((visible) => !visible);
    }

    setMode(mode: AuthMode): void {
        this.mode.set(mode);
        this.errorMessage.set('');
        this.form.reset();
        this.registerForm.reset();
    }

    onSubmit(): void {
        if (this.mode() === 'login') {
            this.submitLogin();
            return;
        }

        this.submitRegister();
    }

    private submitLogin(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');
        this.authService.login(this.form.getRawValue()).subscribe({
            next: (response) => this.redirectByRole(response.role),
            error: () => {
                this.errorMessage.set('Correo o contraseña incorrectos.');
                this.isSubmitting.set(false);
            },
        });
    }

    private submitRegister(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');
        this.authService.register(this.registerForm.getRawValue()).subscribe({
            next: (response) => this.redirectByRole(response.role),
            error: () => {
                this.errorMessage.set('No se pudo crear la cuenta. Verifica los datos.');
                this.isSubmitting.set(false);
            },
        });
    }

    private redirectByRole(role: string): void {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : '/');
    }
}
