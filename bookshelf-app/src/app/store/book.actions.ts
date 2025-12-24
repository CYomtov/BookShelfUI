/**
 * Book Store Actions
 * Defines all actions that can be dispatched to the book store
 */

import { Book, CreateBookRequest, UpdateBookRequest, StatusDto, GenreDto, PaginationParams, PaginatedResponse, BookFilter } from '../models/book.model';

// Fetch Paginated Books (Server-side filtering and pagination)
export class FetchPaginatedBooks {
  static readonly type = '[Books] Fetch Paginated Books';
  constructor(public payload: PaginationParams) {}
}

export class FetchPaginatedBooksSuccess {
  static readonly type = '[Books] Fetch Paginated Books Success';
  constructor(public payload: PaginatedResponse<Book>) {}
}

export class FetchPaginatedBooksError {
  static readonly type = '[Books] Fetch Paginated Books Error';
  constructor(public payload: string) {}
}

// Fetch All Books
export class FetchBooks {
  static readonly type = '[Books] Fetch Books';
}

export class FetchBooksSuccess {
  static readonly type = '[Books] Fetch Books Success';
  constructor(public payload: Book[]) {}
}

export class FetchBooksError {
  static readonly type = '[Books] Fetch Books Error';
  constructor(public payload: string) {}
}

// Fetch Book by ID
export class FetchBookById {
  static readonly type = '[Books] Fetch Book By ID';
  constructor(public payload: number) {}
}

export class FetchBookByIdSuccess {
  static readonly type = '[Books] Fetch Book By ID Success';
  constructor(public payload: Book) {}
}

export class FetchBookByIdError {
  static readonly type = '[Books] Fetch Book By ID Error';
  constructor(public payload: string) {}
}

// Create Book
export class CreateBook {
  static readonly type = '[Books] Create Book';
  constructor(public payload: CreateBookRequest) {}
}

export class CreateBookSuccess {
  static readonly type = '[Books] Create Book Success';
  constructor(public payload: Book) {}
}

export class CreateBookError {
  static readonly type = '[Books] Create Book Error';
  constructor(public payload: string) {}
}

// Update Book
export class UpdateBook {
  static readonly type = '[Books] Update Book';
  constructor(public payload: UpdateBookRequest) {}
}

export class UpdateBookSuccess {
  static readonly type = '[Books] Update Book Success';
  constructor(public payload: Book) {}
}

export class UpdateBookError {
  static readonly type = '[Books] Update Book Error';
  constructor(public payload: string) {}
}

// Delete Book
export class DeleteBook {
  static readonly type = '[Books] Delete Book';
  constructor(public payload: number) {}
}

export class DeleteBookSuccess {
  static readonly type = '[Books] Delete Book Success';
  constructor(public payload: number) {}
}

export class DeleteBookError {
  static readonly type = '[Books] Delete Book Error';
  constructor(public payload: string) {}
}

// Fetch Statuses
export class FetchStatuses {
  static readonly type = '[Lookups] Fetch Statuses';
}

export class FetchStatusesSuccess {
  static readonly type = '[Lookups] Fetch Statuses Success';
  constructor(public payload: StatusDto[]) {}
}

export class FetchStatusesError {
  static readonly type = '[Lookups] Fetch Statuses Error';
  constructor(public payload: string) {}
}

// Fetch Genres
export class FetchGenres {
  static readonly type = '[Lookups] Fetch Genres';
}

export class FetchGenresSuccess {
  static readonly type = '[Lookups] Fetch Genres Success';
  constructor(public payload: GenreDto[]) {}
}

export class FetchGenresError {
  static readonly type = '[Lookups] Fetch Genres Error';
  constructor(public payload: string) {}
}

// Filter/Search Books
export class SetBookFilter {
  static readonly type = '[Books] Set Filter';
  constructor(public payload: BookFilter) {}
}

export class ClearBookFilter {
  static readonly type = '[Books] Clear Filter';
}

// Clear Selection
export class ClearSelectedBook {
  static readonly type = '[Books] Clear Selected Book';
}
