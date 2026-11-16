import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiLoan, ApiLoanStatus } from '../../../../shared/models/api.model';
import { LoanService } from '../../../../shared/services/loan.service';

const LOAN_STATUS_LABELS: Record<ApiLoanStatus, string> = {
    ACTIVE: 'Activo',
    RETURNED: 'Devuelto',
    OVERDUE: 'Vencido',
};

@Component({
    selector: 'app-my-loans',
    imports: [RouterModule],
    templateUrl: './my-loans.html',
    styleUrl: './my-loans.scss',
})
export class MyLoans {
    private readonly loanService = inject(LoanService);

    readonly loans = signal<ApiLoan[]>([]);
    readonly isLoading = signal(true);
    readonly error = signal('');
    readonly notice = signal('');
    readonly processingId = signal<number | null>(null);

    constructor() {
        void this.loadLoans();
    }

    statusLabel(status: ApiLoanStatus): string {
        return LOAN_STATUS_LABELS[status] ?? status;
    }

    formatDate(value?: string | null): string {
        if (!value) {
            return '—';
        }

        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    canReturn(loan: ApiLoan): boolean {
        return loan.status !== 'RETURNED';
    }

    returnLoan(loan: ApiLoan): void {
        this.processingId.set(loan.id);
        this.error.set('');

        this.loanService.returnLoan(loan.id).subscribe({
            next: () => {
                this.processingId.set(null);
                this.showNotice('Libro devuelto correctamente.');
                void this.loadLoans();
            },
            error: () => {
                this.processingId.set(null);
                this.error.set('No se pudo registrar la devolución. Intenta de nuevo.');
            },
        });
    }

    private async loadLoans(): Promise<void> {
        this.isLoading.set(true);

        try {
            this.loans.set(await firstValueFrom(this.loanService.myLoans()));
        } catch {
            this.error.set('No se pudieron cargar tus préstamos. Intenta de nuevo más tarde.');
        } finally {
            this.isLoading.set(false);
        }
    }

    private showNotice(message: string): void {
        this.notice.set(message);
        setTimeout(() => this.notice.set(''), 3000);
    }
}
