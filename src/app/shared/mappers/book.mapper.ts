import {
    ApiBook,
    ApiBookOrigin,
    ApiBookStatus,
    ApiCategory,
} from '../models/api.model';
import { Book, BookOrigin, BookStatus } from '../models/book.model';

const API_STATUS_TO_BOOK: Record<ApiBookStatus, BookStatus> = {
    AVAILABLE: 'available',
    CHECKED_OUT: 'checked-out',
    UNAVAILABLE: 'unavailable',
    IN_LIBRARY: 'in-library',
};

const API_ORIGIN_TO_BOOK: Record<ApiBookOrigin, BookOrigin> = {
    LIBRARY_FUND: 'library-fund',
    COMMUNITY_DONATION: 'community-donation',
    PURCHASED: 'purchased',
};

export const API_CATEGORY_LABELS: Record<ApiCategory, string> = {
    FICTION: 'Ficción',
    NON_FICTION: 'No ficción',
    POETRY: 'Poesía',
    SCIENCE_FICTION: 'Ciencia Ficción',
    CHILDREN: 'Infantil',
    PERSONAL_DEVELOPMENT: 'Desarrollo Personal',
};

export const CATEGORY_SLUG_TO_API: Record<string, ApiCategory> = {
    fiction: 'FICTION',
    'non-fiction': 'NON_FICTION',
    poetry: 'POETRY',
    'science-fiction': 'SCIENCE_FICTION',
    children: 'CHILDREN',
    'personal-development': 'PERSONAL_DEVELOPMENT',
};

const API_CATEGORY_SLUGS: Record<ApiCategory, string> = {
    FICTION: 'fiction',
    NON_FICTION: 'non-fiction',
    POETRY: 'poetry',
    SCIENCE_FICTION: 'science-fiction',
    CHILDREN: 'children',
    PERSONAL_DEVELOPMENT: 'personal-development',
};

export function toBook(apiBook: ApiBook): Book {
    return {
        id: String(apiBook.id),
        title: apiBook.title,
        author: apiBook.author,
        status: API_STATUS_TO_BOOK[apiBook.bookStatus ?? 'UNAVAILABLE'] ?? 'unavailable',
        origin: apiBook.bookOrigin ? API_ORIGIN_TO_BOOK[apiBook.bookOrigin] : undefined,
        likesCount: apiBook.likesCount ?? 0,
        coverUrl: apiBook.coverUrl || openLibraryCover(apiBook.ISBN),
        isbn: apiBook.ISBN,
        sku: apiBook.sku,
        publisher: apiBook.publisher,
        publishedYear: parseYear(apiBook.publishedDate),
        edition: apiBook.edition,
        pages: apiBook.pages,
        stock: apiBook.stock,
        genres: apiBook.category?.map((category) => API_CATEGORY_LABELS[category] ?? category),
    };
}

export function toApiCategory(value: string): ApiCategory | undefined {
    const normalized = normalize(value);
    const entry = Object.entries(API_CATEGORY_LABELS).find(
        ([category, label]) => normalize(label) === normalized || normalize(category) === normalized,
    );

    return entry ? (entry[0] as ApiCategory) : CATEGORY_SLUG_TO_API[normalized.replace(/ /g, '-')];
}

export function toApiStatus(status: BookStatus): ApiBookStatus {
    const statuses: Record<BookStatus, ApiBookStatus> = {
        'available': 'AVAILABLE',
        'checked-out': 'CHECKED_OUT',
        'in-library': 'IN_LIBRARY',
        'unavailable': 'UNAVAILABLE',
    };

    return statuses[status];
}

export function toFrontStatus(status: ApiBookStatus): BookStatus {
    return API_STATUS_TO_BOOK[status] ?? 'unavailable';
}

export function toApiOrigin(origin: BookOrigin): ApiBookOrigin {
    const origins: Record<BookOrigin, ApiBookOrigin> = {
        'library-fund': 'LIBRARY_FUND',
        'community-donation': 'COMMUNITY_DONATION',
        'purchased': 'PURCHASED',
    };

    return origins[origin];
}

export function toFrontOrigin(origin: ApiBookOrigin): BookOrigin {
    return API_ORIGIN_TO_BOOK[origin] ?? 'library-fund';
}

export function toFrontCategorySlug(category: ApiCategory): string {
    return API_CATEGORY_SLUGS[category] ?? 'fiction';
}

export function openLibraryCover(isbn?: string): string | undefined {
    return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : undefined;
}

function parseYear(publishedDate?: string): number | undefined {
    if (!publishedDate) {
        return undefined;
    }

    const year = Number(publishedDate.slice(0, 4));
    return Number.isNaN(year) ? undefined : year;
}

function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
