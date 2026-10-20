export type BookCategory =
  | 'FICTION'
  | 'NON_FICTION'
  | 'POETRY'
  | 'SCIENCE_FICTION'
  | 'CHILDREN'
  | 'PERSONAL_DEVELOPMENT';

export type BookStatus = 'AVAILABLE' | 'CHECKED_OUT' | 'UNAVAILABLE' | 'IN_LIBRARY';

export type BookOrigin = 'LIBRARY_FUND' | 'COMMUNITY_DONATION' | 'PURCHASED';

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  bookStatus: BookStatus;
  bookOrigin: BookOrigin;
  likesCount: number;
  coverUrl: string;
  ISBN: string;
  sku?: string;
  publisher?: string;
  publishedDate?: string;
  edition?: string;
  pages?: number;
  stock: number;
  category: BookCategory[];
  active: boolean;
}

export interface BookCreateRequest {
  title: string;
  author: string;
  bookStatus?: BookStatus;
  bookOrigin?: BookOrigin;
  coverUrl?: string;
  ISBN: string;
  sku?: string;
  publisher?: string;
  publishedDate?: string;
  edition?: string;
  pages?: number;
  stock: number;
  category: BookCategory[];
}

export type BookUpdateRequest = BookCreateRequest;

export interface BookLookupResponse {
  title: string;
  author: string;
  coverUrl: string;
  ISBN: string;
  publisher: string;
  publishedDate: string;
  pages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BookQueryParams {
  search?: string;
  category?: BookCategory;
  page?: number;
  size?: number;
  sort?: string[];
}