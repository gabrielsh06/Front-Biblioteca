export type ApiRole = 'CUSTOMER' | 'ADMIN';

export type ApiBookStatus = 'AVAILABLE' | 'CHECKED_OUT' | 'UNAVAILABLE' | 'IN_LIBRARY';

export type ApiBookOrigin = 'LIBRARY_FUND' | 'COMMUNITY_DONATION' | 'PURCHASED';

export type ApiCategory =
    | 'FICTION'
    | 'NON_FICTION'
    | 'POETRY'
    | 'SCIENCE_FICTION'
    | 'CHILDREN'
    | 'PERSONAL_DEVELOPMENT';

export type ApiLoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export type ApiDonationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApiBookCondition = 'EXCELLENT' | 'GOOD' | 'FAIR';

export interface ApiPage<T> {
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

export interface ApiBook {
    id: number;
    title: string;
    author: string;
    bookStatus?: ApiBookStatus;
    bookOrigin?: ApiBookOrigin;
    likesCount?: number;
    coverUrl?: string;
    ISBN?: string;
    sku?: string;
    publisher?: string;
    publishedDate?: string;
    edition?: string;
    pages?: number;
    stock?: number;
    category?: ApiCategory[];
    active?: boolean;
}

export interface ApiBookRequest {
    title: string;
    author: string;
    bookStatus?: ApiBookStatus;
    bookOrigin?: ApiBookOrigin;
    coverUrl?: string;
    ISBN: string;
    sku?: string;
    publisher?: string;
    publishedDate?: string;
    edition?: string;
    pages?: number;
    stock: number;
    category: ApiCategory[];
}

export interface ApiBookLookup {
    title?: string;
    author?: string;
    coverUrl?: string;
    ISBN?: string;
    publisher?: string;
    publishedDate?: string;
    pages?: number;
}

export interface ApiAuthResponse {
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    role: ApiRole;
}

export interface ApiUser {
    id: number;
    firstName: string;
    lastName: string;
    roles: ApiRole;
    email: string;
    state: boolean;
}

export interface ApiUserCreateRequest {
    firstName: string;
    lastName: string;
    role?: ApiRole;
    email: string;
    password: string;
}

export interface ApiUserUpdateRequest {
    firstName: string;
    lastName: string;
    email: string;
    state?: boolean;
}

export interface ApiLoan {
    id: number;
    userId: number;
    userEmail: string;
    bookId: number;
    bookTitle: string;
    loanDate: string;
    dueDate: string;
    returnedDate?: string | null;
    status: ApiLoanStatus;
}

export interface ApiLoanCreateRequest {
    bookId: number;
}

export interface ApiDonation {
    id: number;
    title: string;
    author: string;
    ISBN?: string;
    category: ApiCategory;
    condition: ApiBookCondition;
    donorName: string;
    donorEmail: string;
    notes?: string;
    status: ApiDonationStatus;
    createdAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    rejectionReason?: string | null;
}

export interface ApiDonationCreateRequest {
    title: string;
    author: string;
    ISBN?: string;
    category: ApiCategory;
    condition: ApiBookCondition;
    donorName: string;
    donorEmail: string;
    notes?: string;
}

export interface ApiDonationStatusRequest {
    status: ApiDonationStatus;
    rejectionReason?: string | null;
}

export interface ApiMessageResponse {
    message: string;
}

export interface ApiMostBorrowedBook {
    bookId: number;
    title: string;
    borrowCount: number;
}

export interface ApiAdminDashboard {
    totalBooks: number;
    activeBooks: number;
    inactiveBooks: number;
    totalStock: number;
    availableStock: number;
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    booksByStatus: Record<string, number>;
    booksByOrigin: Record<string, number>;
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    mostBorrowedBooks: ApiMostBorrowedBook[];
}
