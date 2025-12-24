# Bookshelf Application - Development Guide

## Quick Start Guide for Developers

### Initial Setup (First Time Only)

```bash
cd c:\Code\BookShelfUI\bookshelf-app
npm install
npm start
```

The app will be available at `http://localhost:4200`

---

## 🏗️ Architecture Overview

### Folder Organization

**`models/`** - Data models and interfaces
- `book.model.ts` - Book, BookFilter, CreateBookRequest, UpdateBookRequest interfaces

**`services/`** - HTTP communication layer
- `book.service.ts` - Book REST API client with error handling

**`store/`** - NGXS state management
- `book.actions.ts` - Action classes for dispatching
- `book.state.ts` - State definition, handlers, and selectors
- `book.selectors.ts` - Public selectors for state access

**`components/`** - Presentational components
- `book-list/` - Display all books with filters and sorting
- `book-form/` - Create/edit books with reactive forms

---

## 🔄 Data Flow

### Creating a New Book

1. **User fills form** → Book Form Component
2. **User submits** → `onSubmit()` called
3. **Dispatch action** → `new CreateBook(formData)`
4. **Service HTTP call** → `POST /api/books`
5. **Success/Error** → Dispatch success/error action
6. **State updated** → Book added to store
7. **Selector updates** → `getFilteredBooks()` selector triggers
8. **Component re-renders** → Async pipe subscribes to updated observable

### Fetching Books

1. **Component `ngOnInit`** → Dispatch `FetchBooks` action
2. **Loading state** → `loading = true` in store
3. **Service HTTP call** → `GET /api/books`
4. **Response received** → Dispatch `FetchBooksSuccess` with books array
5. **State updated** → books array populated, loading = false
6. **Component receives data** → Through `books$` observable
7. **Template renders** → *ngFor loop displays books

---

## 📝 Adding New Features

### Example: Add Book Rating Filter

**Step 1: Update Model**
```typescript
// models/book.model.ts
export interface BookFilter {
  // ... existing filters
  minRating: number;  // NEW
}
```

**Step 2: Create Action**
```typescript
// store/book.actions.ts
export class SetRatingFilter {
  static readonly type = '[Books] Set Rating Filter';
  constructor(public payload: number) {}
}
```

**Step 3: Handle Action in State**
```typescript
// store/book.state.ts
@Action(SetRatingFilter)
setRatingFilter(ctx: StateContext<BookStateModel>, action: SetRatingFilter) {
  const state = ctx.getState();
  ctx.setState({
    ...state,
    filter: { ...state.filter, minRating: action.payload },
  });
}
```

**Step 4: Update Selector**
```typescript
// store/book.state.ts - In filteredBooks selector
if (filter.minRating) {
  filtered = filtered.filter((book) => book.rating >= filter.minRating);
}
```

**Step 5: Use in Component**
```typescript
// components/book-list/book-list.component.ts
onRatingFilterChange(minRating: number): void {
  this.store.dispatch(new SetRatingFilter(minRating));
}
```

---

## 🧬 Component Patterns

### Using Store in Components

```typescript
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BookState } from '../../store/book.state';

@Component({
  selector: 'app-my-component',
  standalone: true,
})
export class MyComponent implements OnInit, OnDestroy {
  private store = inject(Store);

  // Select observables from store
  books$ = this.store.select(BookState.books);
  loading$ = this.store.select(BookState.loading);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Dispatch actions
    this.store.dispatch(new FetchBooks());

    // Subscribe to store
    this.books$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(books => {
      // Handle books
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Dispatch action on user interaction
  doSomething(): void {
    this.store.dispatch(new SomeAction(data));
  }
}
```

### Form Pattern with Reactive Forms

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class FormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    author: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    // Process form
    const data = this.form.value;
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }
}
```

---

## 🔍 Debugging

### Redux DevTools

1. Install browser extension
2. Run app with `npm start`
3. Open Redux DevTools
4. See all actions and state changes
5. Time-travel debug by clicking actions

### Console Logging

NGXS Logger Plugin automatically logs:
```
[NGXS] Dispatching action FetchBooks
  payload: undefined
[NGXS] Dispatching action FetchBooksSuccess
  payload: [Book, Book, ...]
```

### Network Debugging

1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger actions that call API
4. Click requests to see request/response
5. Check status codes and payloads

---

## ✅ Common Tasks

### Display Loading Spinner While Fetching

```html
<div *ngIf="loading$ | async" class="spinner">
  Loading...
</div>
<div *ngIf="!(loading$ | async)" class="content">
  <!-- Content here -->
</div>
```

### Display Error Messages

```html
<div *ngIf="error$ | async as error" class="alert alert-danger">
  {{ error }}
</div>
```

### Track Performance in *ngFor

```html
<div *ngFor="let book of books$ | async; trackBy: trackByBookId">
  {{ book.title }}
</div>
```

```typescript
trackByBookId(index: number, book: Book): string {
  return book.id;
}
```

### Handle Form Validation Errors

```html
<input formControlName="title" />
<div class="error" *ngIf="hasError('title', 'required')">
  Title is required
</div>
<div class="error" *ngIf="hasError('title', 'minlength')">
  Title must be at least 3 characters
</div>
```

---

## 📦 Dependency Management

### Core Dependencies

```json
{
  "@angular/core": "^21.0.0",
  "@angular/router": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "@ngxs/store": "latest",
  "@ngxs/logger-plugin": "latest",
  "@ngxs/devtools-plugin": "latest",
  "rxjs": "~7.8.0"
}
```

### Installing New Packages

```bash
npm install package-name
```

### Updating Packages

```bash
npm update
```

---

## 🚀 Build & Deployment

### Development Build

```bash
npm start
```

### Production Build

```bash
npm run build
```

Output: `dist/bookshelf-app/browser/`

### Development with Source Maps

```bash
npm run watch
```

---

## 🧪 Testing Preparation

### Test Structure Ready For

- Unit tests for services
- Component tests
- State tests
- E2E tests

*Implement tests using Vitest (already installed)*

---

## 📋 Code Style & Standards

### Naming Conventions

- **Components**: `kebab-case` files, PascalCase classes
  - `book-list.component.ts` → `BookListComponent`
- **Services**: PascalCase with Service suffix
  - `book.service.ts` → `BookService`
- **State**: PascalCase with State suffix
  - `book.state.ts` → `BookState`
- **Actions**: PascalCase, descriptive names
  - `FetchBooks`, `CreateBookSuccess`
- **Selectors**: camelCase, descriptive
  - `filteredBooks`, `selectedBook`

### File Organization

```
feature/
├── feature.component.ts
├── feature.component.html
├── feature.component.scss
└── feature.component.spec.ts
```

### Import Order

1. Angular imports
2. Third-party imports
3. Local imports
4. Relative imports

---

## 🚨 Common Issues & Solutions

**Issue**: Components not updating after state change
- **Solution**: Use `async` pipe or subscribe properly, ensure selectors are correct

**Issue**: Form validation not showing
- **Solution**: Call `markAsTouched()` on fields, check error detection logic

**Issue**: API calls not working
- **Solution**: Check environment config, verify CORS on API, check network tab

**Issue**: Memory leaks in subscriptions
- **Solution**: Always implement `OnDestroy` and use `takeUntil(destroy$)`

---

## 📚 Next Steps

1. **Connect to your API** - Update `environment.ts` with API URL
2. **Test the flows** - Create, read, update, delete books
3. **Add more features** - Follow the patterns established
4. **Implement authentication** - Add login/authorization
5. **Add unit tests** - Test services and components
6. **Deploy** - Build and deploy to production

---

For more help, refer to `ANGULAR_README.md` or the main project documentation.
