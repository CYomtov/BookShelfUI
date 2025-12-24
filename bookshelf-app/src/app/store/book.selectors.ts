/**
 * Book Store Selectors
 * Best Practice: Use selectors for efficient, memoized state access
 * Provides a single source of truth for accessing state values
 */

import { Injectable } from '@angular/core';
import { Selector } from '@ngxs/store';
import { Book, BookFilter, BookStateModel } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookSelectors {
  /**
   * Select all books from state
   */
  @Selector()
  static getBooks(state: { books: BookStateModel }): Book[] {
    return state.books.books;
  }

  /**
   * Select selected book
   */
  @Selector()
  static getSelectedBook(state: { books: BookStateModel }): Book | null {
    return state.books.selectedBook;
  }

  /**
   * Select loading state
   */
  @Selector()
  static isLoading(state: { books: BookStateModel }): boolean {
    return state.books.loading;
  }

  /**
   * Select error state
   */
  @Selector()
  static getError(state: { books: BookStateModel }): string | null {
    return state.books.error;
  }

  /**
   * Select filter
   */
  @Selector()
  static getFilter(state: { books: BookStateModel }): BookFilter {
    return state.books.filter;
  }

  /**
   * Select filtered books
   * Best Practice: Memoized selector that filters books based on current filter
   */
  @Selector()
  static getFilteredBooks(state: { books: BookStateModel }): Book[] {
    // Server returns filtered/sorted/paginated items — return raw list
    return state.books.books;
  }

  /**
   * Get books count
   */
  @Selector()
  static getBooksCount(state: { books: BookStateModel }): number {
    return state.books.books.length;
  }
  /**
   * Get filtered books count
   */
  @Selector()
  static getFilteredBooksCount(state: { books: BookStateModel }): number {
    return state.books.books.length;
  }
}
