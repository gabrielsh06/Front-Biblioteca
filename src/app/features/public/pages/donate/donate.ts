import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { toApiCategory } from '../../../../shared/mappers/book.mapper';
import { ApiBookCondition } from '../../../../shared/models/api.model';
import { PARENT_CATEGORIES } from '../../../../shared/models/book.model';
import { DonationService } from '../../../../shared/services/donation.service';

@Component({
    selector: 'app-donate',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './donate.html',
    styleUrl: './donate.scss',
})
export class Donate {
    private readonly fb = new FormBuilder();
    private readonly donationService = inject(DonationService);

    readonly categories = PARENT_CATEGORIES;
    readonly isSubmitted = signal(false);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal('');

    readonly form = this.fb.nonNullable.group({
        title: ['', [Validators.required]],
        author: ['', [Validators.required]],
        isbn: [''],
        category: ['', [Validators.required]],
        condition: ['', [Validators.required]],
        donorName: ['', [Validators.required]],
        donorEmail: ['', [Validators.required, Validators.email]],
        notes: [''],
    });

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const values = this.form.getRawValue();

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        this.donationService.createDonation({
            title: values.title.trim(),
            author: values.author.trim(),
            ISBN: values.isbn.trim() || undefined,
            category: toApiCategory(values.category) ?? 'FICTION',
            condition: values.condition as ApiBookCondition,
            donorName: values.donorName.trim(),
            donorEmail: values.donorEmail.trim(),
            notes: values.notes.trim() || undefined,
        }).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.isSubmitted.set(true);
            },
            error: (error: HttpErrorResponse) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(
                    error.error?.message
                        ?? 'No se pudo registrar la donación. Revisa los datos e intenta de nuevo.',
                );
            },
        });
    }

    startAnother(): void {
        this.form.reset();
        this.errorMessage.set('');
        this.isSubmitted.set(false);
    }
}
