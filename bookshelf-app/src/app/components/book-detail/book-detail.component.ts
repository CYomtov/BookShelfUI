import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Book } from '../../models/book.model';
import { FetchBookById, DeleteBook, ClearSelectedBook } from '../../store/book.actions';
import { BookState } from '../../store/book.state';

/**
 * Book Detail Component
 * Displays detailed information about a single book
 * Allows viewing, editing, and deleting a book
 */
@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
})
export class BookDetailComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedBook$ = this.store.select(BookState.selectedBook);
  loading$ = this.store.select(BookState.loading);
  error$ = this.store.select(BookState.error);

  bookId: number | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Get book ID from route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.bookId = parseInt(params['id'], 10);
        this.loadBookDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(new ClearSelectedBook());
  }

  /**
   * Load book details from API
   */
  loadBookDetails(): void {
    if (this.bookId) {
      this.store.dispatch(new FetchBookById(this.bookId));
    }
  }

  /**
   * Delete the book
   */
  deleteBook(): void {
    if (this.bookId && confirm('Are you sure you want to delete this book?')) {
      this.store.dispatch(new DeleteBook(this.bookId));
      // Navigate back after deletion
      setTimeout(() => {
        this.router.navigate(['/books']);
      }, 500);
    }
  }

  /**
   * Navigate to edit mode
   */
  editBook(): void {
    if (this.bookId) {
      this.router.navigate(['/books', this.bookId, 'edit']);
    }
  }

  /**
   * Go back to books list
   */
  goBack(): void {
    this.router.navigate(['/books']);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get star rating display
   */
  getStarRating(rating: number | null): string {
    if (!rating) return 'Not rated';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    return `${stars} (${rating}/5)`;
  }
}
