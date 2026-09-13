export type BookStatus = 'available' | 'checked-out' | 'unavailable' | 'in-library';

export interface Book {
    id: string;
    title: string;
    author: string;
    price?: number;
    status: BookStatus;
    coverUrl?: string;
    isbn?: string;
    sku?: string;
    publisher?: string;
    publishedYear?: number;
    pages?: number;
    language?: string;
    synopsis?: string;
    targetAge?: string;
    genres?: string[];
    dimensions?: {
        heightCm?: number;
        widthCm?: number;
        thicknessCm?: number;
        weightGrams?: number;
    };
}

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
    'available': 'Disponible',
    'checked-out': 'Prestado',
    'unavailable': 'No disponible',
    'in-library': 'En biblioteca'
};
