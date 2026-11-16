import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrl: '../login/login.scss',
})
export class ForgotPassword {
    private readonly fb = new FormBuilder();
    private readonly auth = inject(AuthService);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
    });
    readonly isSubmitted = signal(false);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal('');
    readonly successMessage = signal('');

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        this.auth.forgotPassword(this.form.controls.email.value.trim()).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.isSubmitted.set(true);
                this.successMessage.set(
                    response.message
                        || 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',
                );
            },
            error: (error: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(
                    error.error?.message
                        ?? 'No se pudo procesar la solicitud. Intenta de nuevo más tarde.',
                );
            },
        });
    }
}
