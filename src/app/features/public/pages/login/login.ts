import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginCredentials } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = new FormBuilder();
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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

    const credentials: LoginCredentials = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login(credentials).subscribe({
      next: (auth) => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl(auth.role === 'ADMIN' ? '/admin' : '/');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Intenta nuevamente.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'El correo o la contraseña son incorrectos.';
    }

    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
}