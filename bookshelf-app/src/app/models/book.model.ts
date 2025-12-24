/**
 * Book DTO
 * Represents the structure of a book entity from the API
 */
export interface Book {
  id: number;
  title: string | null;
  author: string | null;
  isbn: string | null;
  publishedYear: number | null;
  genre: string | null;
  status: string | null;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Status Lookup DTO
 * Represents a book status option
 */
export interface StatusDto {
  statusId: number;
  statusName: string | null;
}

/**
 * Genre Lookup DTO
 * Represents a book genre option
 */
export interface GenreDto {
  genreId: number;
  genreName: string | null;
}

/**
 * Create Book Request DTO
 * Used when sending new book data to the API
 * Required fields: title, author, statusId
 */
export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string | null;
  publishedYear?: number | null;
  genreId?: number | null;
  statusId: number;
  rating?: number | null;
}

/**
 * Update Book Request DTO
 * Used when updating existing book data
 * Required fields: id, title, author, statusId
 */
export interface UpdateBookRequest extends CreateBookRequest {
  id: number;
}

/**
 * Book State Interface
 * Represents the shape of book state in the store
 */
export interface BookStateModel {
  books: Book[];
  selectedBook: Book | null;
  loading: boolean;
  error: string | null;
  filter: BookFilter;
  statuses: StatusDto[];
  genres: GenreDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Filter criteria for books
 */
export interface BookFilter {
  searchTerm: string;
  statusId: number | null;
  genreId: number | null;
  sortBy: 'title' | 'author' | 'rating' | 'publishedYear' | 'genre' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination Request Parameters
 */
export interface PaginationParams {
  // Matches backend BookQueryParameters
  Page: number;
  PageSize: number;
  SearchText?: string;
  StatusId?: number | null;
  GenreId?: number | null;
  SortBy?: string;
  SortDir?: 'asc' | 'desc';
}

/**
 * Paginated Response from Server
 */
export interface PaginatedResponse<T> {
  // Matches backend PagedResult<T> (JSON uses camelCase/lowercase keys)
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
