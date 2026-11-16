import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './reset-password.html',
    styleUrl: '../login/login.scss',
})
export class ResetPassword {
    private readonly fb = new FormBuilder();
    private readonly route = inject(ActivatedRoute);
    private readonly auth = inject(AuthService);

    readonly token = this.route.snapshot.queryParamMap.get('token')
        ?? this.route.snapshot.paramMap.get('token')
        ?? '';
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal('');
    readonly successMessage = signal('');

    readonly form = this.fb.nonNullable.group(
        {
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: this.passwordsMatch },
    );

    onSubmit(): void {
        if (!this.token) {
            this.errorMessage.set('El enlace no contiene un token válido. Solicita uno nuevo.');
            return;
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        this.auth.resetPassword(this.token, this.form.controls.newPassword.value).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.successMessage.set(
                    response.message || 'Contraseña actualizada correctamente.',
                );
            },
            error: (error: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(
                    error.error?.message
                        ?? 'El enlace es inválido o venció. Solicita uno nuevo.',
                );
            },
        });
    }

    private passwordsMatch(control: AbstractControl): ValidationErrors | null {
        const password = control.get('newPassword')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordsMismatch: true };
    }
}
