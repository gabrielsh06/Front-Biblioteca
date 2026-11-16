import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './register.html',
    styleUrl: '../login/login.scss',
})
export class Register {
    private readonly fb = new FormBuilder();
    private readonly router = inject(Router);
    private readonly auth = inject(AuthService);

    readonly form = this.fb.nonNullable.group(
        {
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: this.passwordsMatch },
    );

    readonly isPasswordVisible = signal(false);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal('');

    togglePasswordVisibility(): void {
        this.isPasswordVisible.update((visible) => !visible);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { firstName, lastName, email, password } = this.form.getRawValue();

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        this.auth.register({ firstName, lastName, email, password }).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                void this.router.navigateByUrl('/');
            },
            error: (error: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(
                    error.status === 409
                        ? 'Ya existe una cuenta con ese correo electrónico.'
                        : 'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.',
                );
            },
        });
    }

    private passwordsMatch(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordsMismatch: true };
    }
}
