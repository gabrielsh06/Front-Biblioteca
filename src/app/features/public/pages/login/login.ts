import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginCredentials } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = new FormBuilder();

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
    // cuando exista el backend/endpoint de login.
    this.isSubmitting.set(true);
    console.log('Login enviado:', credentials);
    setTimeout(() => this.isSubmitting.set(false), 800);
  }
}