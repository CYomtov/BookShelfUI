import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Book, CreateBookRequest, UpdateBookRequest, StatusDto, GenreDto, PaginationParams, PaginatedResponse } from '../models/book.model';
import { environment } from '../../environments/environment';

/**
 * Book Service
 * Handles all HTTP communication with the .NET Core 10 API
 * Best Practice: Single Responsibility - only handles API communication
 * Uses environment configuration for API URLs
 */
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/Books`;
  private readonly lookupsUrl = `${environment.apiUrl}/Lookups`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all books from the API
   * GET /api/Books
   */
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Fetch paginated and filtered books from the API
   * GET /api/Books/search with query parameters
   */
  getBooks(params: PaginationParams): Observable<PaginatedResponse<Book>> {
    let httpParams = new HttpParams()
      .set('Page', params.Page.toString())
      .set('PageSize', params.PageSize.toString());

    if (params.SearchText) {
      httpParams = httpParams.set('SearchText', params.SearchText);
    }
    if (params.StatusId !== undefined && params.StatusId !== null) {
      httpParams = httpParams.set('StatusId', String(params.StatusId));
    }
    if (params.GenreId !== undefined && params.GenreId !== null) {
      httpParams = httpParams.set('GenreId', String(params.GenreId));
    }
    if (params.SortBy) {
      httpParams = httpParams.set('SortBy', params.SortBy);
    }
    if (params.SortDir) {
      httpParams = httpParams.set('SortDir', params.SortDir);
    }

    return this.http.get<PaginatedResponse<Book>>(`${this.apiUrl}/paged`, { params: httpParams }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Fetch a single book by ID
   * GET /api/Books/{id}
   */
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Create a new book
   * POST /api/Books/createBook
   */
  createBook(book: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/createBook`, book).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Update an existing book
   * POST /api/Books/updateBook
   */
  updateBook(book: UpdateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/updateBook`, book).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Delete a book
   * DELETE /api/Books/{id}
   */
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Fetch all available statuses for books
   * GET /api/Lookups/statuses
   */
  getStatuses(): Observable<StatusDto[]> {
    return this.http.get<StatusDto[]>(`${this.lookupsUrl}/statuses`).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Fetch all available genres for books
   * GET /api/Lookups/Genres
   */
  getGenres(): Observable<GenreDto[]> {
    return this.http.get<GenreDto[]>(`${this.lookupsUrl}/Genres`).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Error handling
   * Best Practice: Centralized error handling with detailed diagnostics
   * SSR-safe: Checks if ErrorEvent exists before using it (not available in Node.js)
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    // Check if ErrorEvent is defined (browser environment) and if error is client-side
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Client-side error (network error, timeout, CORS, etc.)
      errorMessage = `Network Error: ${error.error.message}`;
    } else {
      // Server-side error or connection error
      if (error.status === 0) {
        errorMessage = `Connection Error: Unable to reach API at ${this.apiUrl}. Make sure the API server is running on port 7181 and CORS is configured.`;
      } else {
        errorMessage = `Server Error (${error.status}): ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
