import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth.service';
import { BookApiService } from '../../../../shared/services/book-api.service';
import { LoanService } from '../../../../shared/services/loan.service';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly router = inject(Router);
  private readonly bookApi = inject(BookApiService);
  private readonly userService = inject(UserService);
  private readonly loanService = inject(LoanService);
  readonly auth = inject(AuthService);

  readonly bookCount = signal<number | null>(null);
  readonly userCount = signal<number | null>(null);
  readonly loanCount = signal<number | null>(null);

  constructor() {
    void this.loadCounts();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private async loadCounts(): Promise<void> {
    const [books, users, loans] = await Promise.allSettled([
      firstValueFrom(this.bookApi.getBooks({ size: 1 })),
      firstValueFrom(this.userService.getAllUsers()),
      firstValueFrom(this.loanService.allLoans()),
    ]);

    if (books.status === 'fulfilled') {
      this.bookCount.set(books.value.totalElements);
    }
    if (users.status === 'fulfilled') {
      this.userCount.set(users.value.length);
    }
    if (loans.status === 'fulfilled') {
      this.loanCount.set(loans.value.length);
    }
  }
}
