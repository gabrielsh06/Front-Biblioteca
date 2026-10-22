import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
