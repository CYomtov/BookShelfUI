import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Book, StatusDto, GenreDto, PaginationParams } from '../../models/book.model';
import {
  FetchPaginatedBooks,
  FetchStatuses,
  FetchGenres,
  SetBookFilter,
  DeleteBook,
  ClearSelectedBook,
} from '../../store/book.actions';
import { BookState } from '../../store/book.state';

interface SortConfig {
  column: 'title' | 'author' | 'genre' | 'status' | 'rating' | 'publishedYear';
  direction: 'asc' | 'desc';
}

/**
 * Book List Component with Server-Side Pagination
 * Uses Angular 21 signals for state management
 * Implements responsive table with sorting and server-side pagination/filtering
 */
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  books$ = this.store.select(BookState.books);
  loading$ = this.store.select(BookState.loading);
  error$ = this.store.select(BookState.error);
  genres$ = this.store.select(BookState.availableGenres);
  statuses$ = this.store.select(BookState.availableStatuses);
  pagination$ = this.store.select(BookState.pagination);

  // Modern Angular 21 Signals for local filter state
  searchTerm = signal('');
  selectedGenreId = signal<number | null>(null);
  selectedStatusId = signal<number | null>(null);
  sortConfig = signal<SortConfig>({ column: 'title', direction: 'asc' });

  // Local pagination state (updated from store)
  currentPage = signal(1);
  pageSize = signal(10);
  totalBooks = signal(0);
  totalPages = signal(0);
  // Trigger CSS enter animation when data finishes loading
  animateList = signal(false);
  // Trigger CSS leave animation when doing page changes
  animateListOut = signal(false);
  // Track rows that are leaving (deletion animation)
  leaving = signal<number[]>([]);
  // Animation duration (ms) used for timeouts
  private readonly ANIM_MS = 320;

  // Computed values for display
  displayColumns = computed(() => [
    'title',
    'author',
    'genre',
    'status',
    'rating',
    'publishedYear',
    'actions',
  ]);

  // Pagination computed properties
  canPreviousPage = computed(() => this.currentPage() > 1);
  canNextPage = computed(() => this.currentPage() < this.totalPages());

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    // If total pages is small, show all pages
    const maxButtons = 5;
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    const window = 1; // pages to show on each side of current
    const left = Math.max(2, current - window);
    const right = Math.min(total - 1, current + window);

    pages.push(1);
    if (left > 2) pages.push(-1); // ellipsis

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < total - 1) pages.push(-1); // ellipsis
    pages.push(total);

    return pages;
  });

  // Server-side paginated books from store
  paginatedBooks = computed(() => {
    return this.store.selectSignal(BookState.books)();
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Load initial statuses and genres
    this.store.dispatch(new FetchStatuses());
    this.store.dispatch(new FetchGenres());

    // Subscribe to pagination state from store
    this.pagination$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pagination) => {
        this.currentPage.set(pagination.currentPage);
        this.pageSize.set(pagination.pageSize);
        this.totalBooks.set(pagination.totalCount);
        this.totalPages.set(pagination.totalPages);
      });

    // Trigger a CSS-based enter animation when loading completes
    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        if (!loading) {
          this.animateList.set(true);
          // remove the class on next tick so elements transition to visible state
          setTimeout(() => this.animateList.set(false), 20);
        }
      });

    // Load initial paginated books
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load paginated books with current filters and pagination settings
   */
  loadData(): void {
    const params: PaginationParams = {
      Page: this.currentPage(),
      PageSize: this.pageSize(),
      SearchText: this.searchTerm() || undefined,
      StatusId: this.selectedStatusId() || undefined,
      GenreId: this.selectedGenreId() || undefined,
      SortBy: this.sortConfig().column,
      SortDir: this.sortConfig().direction,
    };

    this.store.dispatch(new FetchPaginatedBooks(params));
  }


  /**
   * Update search filter and reload data
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    // animate out then load
    this.animateListOut.set(true);
    setTimeout(() => {
      this.currentPage.set(1);
      this.loadData();
      this.animateListOut.set(false);
    }, this.ANIM_MS);
  }

  /**
   * Update genre filter and reload data
   */
  onGenreChange(genreId: string): void {
    const id = genreId ? parseInt(genreId, 10) : null;
    this.selectedGenreId.set(id);
    this.animateListOut.set(true);
    setTimeout(() => {
      this.currentPage.set(1);
      this.loadData();
      this.animateListOut.set(false);
    }, this.ANIM_MS);
  }

  /**
   * Update status filter and reload data
   */
  onStatusChange(statusId: string): void {
    const id = statusId ? parseInt(statusId, 10) : null;
    this.selectedStatusId.set(id);
    this.animateListOut.set(true);
    setTimeout(() => {
      this.currentPage.set(1);
      this.loadData();
      this.animateListOut.set(false);
    }, this.ANIM_MS);
  }

  /**
   * Update sort options and reload data
   */
  onSortChange(column: 'title' | 'author' | 'genre' | 'status' | 'rating' | 'publishedYear'): void {
    const current = this.sortConfig();

    if (current.column === column) {
      // Toggle direction if same column
      this.sortConfig.set({
        column,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // New column, sort ascending
      this.sortConfig.set({
        column,
        direction: 'asc',
      });
    }

    this.animateListOut.set(true);
    setTimeout(() => {
      this.currentPage.set(1);
      this.loadData();
      this.animateListOut.set(false);
    }, this.ANIM_MS);
  }

  /**
   * Delete a book
   */
  deleteBook(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      // mark as leaving to play CSS leave animation, then dispatch
      this.leaving.set([...this.leaving(), id]);
      setTimeout(() => {
        this.store.dispatch(new DeleteBook(id));
        this.leaving.set(this.leaving().filter((x) => x !== id));
      }, this.ANIM_MS);
    }
  }

  /**
   * Select book and navigate to detail view
   */
  selectBook(book: Book): void {
    this.router.navigate(['/books', book.id]);
  }

  /**
   * Navigate to edit book
   */
  editBook(book: Book, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/books', book.id, 'edit']);
  }

  /**
   * Get sort indicator for column
   */
  getSortIndicator(column: string): string {
    const config = this.sortConfig();
    if (config.column === column) {
      return config.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  }

  /**
   * Track by function for *ngFor optimization
   */
  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  /**
   * Track by function for genres
   */
  trackByGenreId(index: number, genre: GenreDto): number {
    return genre.genreId;
  }

  /**
   * Track by function for statuses
   */
  trackByStatusId(index: number, status: StatusDto): number {
    return status.statusId;
  }

  /**
   * Get value from event target
   */
  getEventTargetValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  /**
   * Convert number to string for select binding
   */
  getGenreSelectValue(): string {
    const id = this.selectedGenreId();
    return id ? String(id) : '';
  }

  /**
   * Convert number to string for select binding
   */
  getStatusSelectValue(): string {
    const id = this.selectedStatusId();
    return id ? String(id) : '';
  }

  /**
   * Get status badge CSS class
   */
  getStatusBadgeClass(status: string | null): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('read')) return 'badge-success';
    if (statusLower.includes('reading')) return 'badge-info';
    if (statusLower.includes('want')) return 'badge-warning';
    return 'badge-default';
  }

  /**
   * Pagination methods that dispatch server-side pagination
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.animateListOut.set(true);
      setTimeout(() => {
        this.currentPage.set(page);
        this.loadData();
        this.animateListOut.set(false);
      }, this.ANIM_MS);
    }
  }

  previousPage(): void {
    if (this.canPreviousPage()) {
      this.animateListOut.set(true);
      setTimeout(() => {
        this.currentPage.set(this.currentPage() - 1);
        this.loadData();
        this.animateListOut.set(false);
      }, this.ANIM_MS);
    }
  }

  nextPage(): void {
    if (this.canNextPage()) {
      this.animateListOut.set(true);
      setTimeout(() => {
        this.currentPage.set(this.currentPage() + 1);
        this.loadData();
        this.animateListOut.set(false);
      }, this.ANIM_MS);
    }
  }

  changePageSize(size: number): void {
    this.animateListOut.set(true);
    setTimeout(() => {
      this.pageSize.set(size);
      this.currentPage.set(1);
      this.loadData();
      this.animateListOut.set(false);
    }, this.ANIM_MS);
  }

  /**
   * Get pagination info text
   */
  getPaginationInfo(): string {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.totalBooks());
    const total = this.totalBooks();
    if (total === 0) return 'No books found';
    return `Showing ${start}-${end} of ${total} books`;
  }
}
