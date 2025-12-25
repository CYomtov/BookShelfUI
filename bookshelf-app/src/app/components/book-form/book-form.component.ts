import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Book, CreateBookRequest, StatusDto, GenreDto } from '../../models/book.model';
import {
  CreateBook,
  UpdateBook,
  FetchStatuses,
  FetchGenres,
  FetchBookById,
  ClearSelectedBook,
} from '../../store/book.actions';
import { BookState } from '../../store/book.state';

/**
 * Book Form Component
 * Best Practice: Reactive Forms for better control and validation
 * Handles both create and edit operations
 */
@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFormComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);

  bookForm!: FormGroup;
  loading$ = this.store.select(BookState.loading);
  error$ = this.store.select(BookState.error);
  selectedBook$ = this.store.select(BookState.selectedBook);
  statuses$ = this.store.select(BookState.availableStatuses);
  genres$ = this.store.select(BookState.availableGenres);

  isEditMode = false;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadLookupData();
    this.initializeForm();
    this.handleRouteParams();
    this.subscribeToSelectedBook();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle route params to determine create vs edit mode
   */
  private handleRouteParams(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        const bookId = parseInt(idParam, 10);
        if (!Number.isNaN(bookId)) {
          const selected = this.store.selectSnapshot(BookState.selectedBook);
          if (!selected || selected.id !== bookId) {
            this.store.dispatch(new FetchBookById(bookId));
          } else {
            this.populateFormWithBook(selected);
          }
          this.setEditMode(true);
        }
      } else {
        this.setEditMode(false);
        this.store.dispatch(new ClearSelectedBook());
        this.bookForm.reset();
        this.cd.markForCheck();
      }
    });
  }

  /**
   * Load status and genre lookup data
   */
  private loadLookupData(): void {
    this.store.dispatch(new FetchStatuses());
    this.store.dispatch(new FetchGenres());
  }

  /**
   * Initialize form with validators
   * Best Practice: Reactive forms with proper validation
   */
  private initializeForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      author: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(150)]],
      isbn: ['', [Validators.minLength(0), Validators.maxLength(20)]],
      publishedYear: ['', [Validators.min(0), Validators.max(3000)]],
      genreId: [''],
      statusId: ['', Validators.required],
      rating: ['', [Validators.min(0), Validators.max(5)]],
    });
  }

  /**
   * Subscribe to selected book for edit mode
   */
  private subscribeToSelectedBook(): void {
    this.selectedBook$.pipe(takeUntil(this.destroy$)).subscribe((book) => {
      if (book) {
        this.setEditMode(true);
        this.populateFormWithBook(book);
      } else {
        this.setEditMode(false);
        this.bookForm.reset();
        this.cd.markForCheck();
      }
    });
  }

  /**
   * Populate form with book data for editing
   */
  private populateFormWithBook(book: Book): void {
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      genreId: book.genre ? this.getGenreIdByName(book.genre) : '',
      statusId: book.status ? this.getStatusIdByName(book.status) : '',
      rating: book.rating,
    });
    this.cd.markForCheck();
  }

  /**
   * Get genre ID by genre name
   */
  private getGenreIdByName(genreName: string): number | null {
    const genres = this.store.selectSnapshot(BookState.availableGenres);
    const genre = genres.find((g) => g.genreName === genreName);
    return genre ? genre.genreId : null;
  }

  /**
   * Get status ID by status name
   */
  private getStatusIdByName(statusName: string): number | null {
    const statuses = this.store.selectSnapshot(BookState.availableStatuses);
    const status = statuses.find((s) => s.statusName === statusName);
    return status ? status.statusId : null;
  }

  /**
   * Submit form
   * Best Practice: Check form validity before submitting
   */
  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.markFormGroupTouched(this.bookForm);
      return;
    }

    const formValue = this.bookForm.value;
    const bookData: CreateBookRequest = {
      title: formValue.title,
      author: formValue.author,
      isbn: formValue.isbn || null,
      publishedYear: formValue.publishedYear || null,
      genreId: formValue.genreId || null,
      statusId: parseInt(formValue.statusId, 10),
      rating: formValue.rating || null,
    };

    if (this.isEditMode) {
      const selectedBook = this.store.selectSnapshot(BookState.selectedBook);
      if (selectedBook) {
        this.store.dispatch(new UpdateBook({ ...bookData, id: selectedBook.id }));
      }
    } else {
      this.store.dispatch(new CreateBook(bookData));
    }

    // Navigate back to list after submission
    setTimeout(() => {
      this.router.navigate(['/books']);
    }, 1000);
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.bookForm.reset();
    this.cd.markForCheck();
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.bookForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Get form field
   */
  getFormField(fieldName: string) {
    return this.bookForm.get(fieldName);
  }

  /**
   * Update edit mode flag and request change detection when needed
   */
  private setEditMode(isEdit: boolean): void {
    if (this.isEditMode !== isEdit) {
      this.isEditMode = isEdit;
      this.cd.markForCheck();
    }
  }
}
