export type BookStatus = 'available' | 'checked-out' | 'unavailable' | 'in-library';
export type BookOrigin = 'library-fund' | 'community-donation' | 'purchased';

export interface ParentCategory {
    label: string;
    slug: string;
}

export const PARENT_CATEGORIES: ParentCategory[] = [
    { label: 'Ficción', slug: 'fiction' },
    { label: 'No ficción', slug: 'non-fiction' },
    { label: 'Poesía', slug: 'poetry' },
    { label: 'Ciencia Ficción', slug: 'science-fiction' },
    { label: 'Infantil', slug: 'children' },
    { label: 'Desarrollo Personal', slug: 'personal-development' },
];

export interface Book {
    id: string;
    title: string;
    author: string;
    price?: number;
    status: BookStatus;
    origin?: BookOrigin;
    likesCount?: number;
    coverUrl?: string;
    isbn?: string;
    sku?: string;
    publisher?: string;
    publishedYear?: number;
    edition?: string;
    pages?: number;
    stock?: number;
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

export const BOOK_ORIGIN_LABELS: Record<BookOrigin, string> = {
    'library-fund': 'Fondo de la Biblioteca',
    'community-donation': 'Donado por la comunidad',
    'purchased': 'Comprado'
};
