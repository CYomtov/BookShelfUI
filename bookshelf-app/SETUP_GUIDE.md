# Bookshelf Application - Complete Setup Guide

## Project Overview

This is a complete Angular 21 application with NGXS state management, designed to communicate with a .NET Core 10 API for managing a bookshelf application.

### Key Features
- **NGXS State Management**: Centralized, scalable state management with debugging tools
- **Reactive Forms**: Form validation and error handling
- **Type-Safe**: Full TypeScript typing throughout the application
- **RESTful API Integration**: HTTP service layer for .NET Core 10 backend
- **Responsive UI**: Mobile-friendly components with SCSS styling
- **Best Practices**: Clean architecture, separation of concerns, OnDestroy cleanup

---

## Project Structure

```
bookshelf-app/
├── src/
│   ├── app/
│   │   ├── store/              # NGXS State Management
│   │   │   ├── book.actions.ts        # All store actions
│   │   │   ├── book.state.ts          # State definition and reducers
│   │   │   └── book.selectors.ts      # Memoized state selectors
│   │   ├── services/
│   │   │   └── book.service.ts        # HTTP API communication
│   │   ├── models/
│   │   │   └── book.model.ts          # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── book-list/             # List and filter component
│   │   │   └── book-form/             # Add/edit form component
│   │   ├── app.ts                     # Root component
│   │   ├── app.html                   # Root template with navigation
│   │   ├── app.scss                   # Global styles
│   │   ├── app.routes.ts              # Application routing
│   │   └── app.config.ts              # App configuration with NGXS
│   ├── environments/
│   │   ├── environment.ts             # Development config
│   │   └── environment.prod.ts        # Production config
│   └── main.ts                        # Bootstrap
├── angular.json                       # Angular CLI config
├── tsconfig.json                      # TypeScript config
└── package.json                       # Dependencies
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm 10+
- Angular CLI 21+
- TypeScript 5.9+

### Step 1: Install Dependencies
```bash
cd bookshelf-app
npm install
```

### Step 2: Configure API URL
Update the API endpoint in your environment files:

**`src/environments/environment.ts`** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api',
};
```

**`src/environments/environment.prod.ts`** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.bookshelf.com/api',
};
```

### Step 3: Update BookService
In `src/app/services/book.service.ts`, the API URL is configured. Ensure the .NET API is running before testing.

---

## Running the Application

### Development Mode
```bash
npm start
# or
ng serve
```
Application will be available at `http://localhost:4200`

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

---

## NGXS Store Structure

### Actions (`book.actions.ts`)
Actions are dispatched to the store to trigger state changes:

```typescript
// Example: Fetch all books
this.store.dispatch(new FetchBooks());

// Example: Create a book
this.store.dispatch(new CreateBook(bookData));

// Example: Set filter
this.store.dispatch(new SetBookFilter({ searchTerm: 'Angular' }));
```

### State (`book.state.ts`)
Defines the shape of state and how actions modify it:

```typescript
@State<BookStateModel>({
  name: 'books',
  defaults: {
    books: [],
    selectedBook: null,
    loading: false,
    error: null,
    filter: { /* ... */ }
  }
})
```

### Selectors (`book.selectors.ts`)
Efficient, memoized accessors for state:

```typescript
// Component usage
books$ = this.store.select(BookState.books);
filteredBooks$ = this.store.select(BookState.filteredBooks);
loading$ = this.store.select(BookState.loading);
categories$ = this.store.select(BookState.availableCategories);
```

---

## Component Usage

### Book List Component
Displays books with filtering, sorting, and search capabilities:

```typescript
// In component.ts
export class BookListComponent implements OnInit {
  books$ = this.store.select(BookState.filteredBooks);
  loading$ = this.store.select(BookState.loading);
  
  loadBooks(): void {
    this.store.dispatch(new FetchBooks());
  }
}
```

### Book Form Component
Reactive form for adding/editing books with validation:

```typescript
// In component.ts
bookForm = this.fb.group({
  title: ['', [Validators.required, Validators.minLength(3)]],
  author: ['', Validators.required],
  isbn: ['', Validators.pattern(/^\d{10,13}$/)],
  // ... other fields
});

onSubmit(): void {
  if (this.bookForm.valid) {
    this.store.dispatch(new CreateBook(this.bookForm.value));
  }
}
```

---

## HTTP Service Integration

### BookService
Handles all API communication:

```typescript
export class BookService {
  private apiUrl = environment.apiUrl + '/books';
  
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}`);
  }
  
  createBook(book: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}`, book);
  }
  
  // ... other methods
}
```

### Expected .NET API Endpoints

Your .NET Core 10 API should implement:

- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/search?q={query}` - Search books
- `GET /api/books/category/{category}` - Get books by category

---

## Models & Interfaces

### Book Model
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedDate: Date;
  pageCount: number;
  category: string;
  rating: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Request DTOs
```typescript
interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedDate: Date;
  pageCount: number;
  category: string;
  imageUrl: string;
}

interface UpdateBookRequest extends CreateBookRequest {
  id: string;
}
```

---

## State Management Flow

```
Component
    ↓
dispatch(Action)
    ↓
Action Handler (@Action)
    ↓
Call Service (HTTP)
    ↓
Success/Error Handler
    ↓
State Update (@State)
    ↓
Selectors Updated (@Selector)
    ↓
Component Observable Updated (Async Pipe)
    ↓
UI Re-rendered
```

---

## Debugging

### NGXS DevTools
The application includes NGXS DevTools in development mode. Use the Redux DevTools browser extension to:
- View all actions dispatched
- Inspect state changes
- Time-travel debugging
- Track action history

### Logger Plugin
All actions and state changes are logged to the console in development mode.

---

## Best Practices Implemented

1. **Standalone Components**: All components are standalone (no module declarations needed)
2. **Reactive Forms**: Using FormBuilder for type-safe, reactive forms
3. **Observables**: Using async pipe in templates to automatically manage subscriptions
4. **OnDestroy**: Proper cleanup of subscriptions in components using takeUntil pattern
5. **Type Safety**: Full TypeScript typing throughout
6. **Separation of Concerns**: Clear separation between components, services, and state
7. **TrackBy Functions**: Optimization of *ngFor loops
8. **Error Handling**: Centralized error handling in services
9. **Loading States**: Proper loading state management in the store
10. **Memoized Selectors**: Efficient selector caching with @Selector decorator

---

## Routing

The application uses Angular's new routing system:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: BookListComponent },
  { path: 'books/add', component: BookFormComponent },
  { path: 'books/:id', component: BookFormComponent },
  { path: '**', redirectTo: 'books' }
];
```

---

## Environment Variables

Update API URLs in environment files:
- Development: `https://localhost:5001/api`
- Production: Your deployed API URL

---

## Styling

### Color Scheme
- Primary: `#4299e1` (Blue)
- Danger: `#e53e3e` (Red)
- Background: `#f7fafc` (Light Gray)
- Text: `#2d3748` (Dark Gray)

### Responsive Design
Breakpoints:
- Desktop: 1400px max-width
- Tablet: 768px
- Mobile: 480px

---

## Common Tasks

### Adding a New Feature

1. **Create Action** in `book.actions.ts`
```typescript
export class MyNewAction {
  static readonly type = '[Books] My New Action';
  constructor(public payload: any) {}
}
```

2. **Add Handler** in `book.state.ts`
```typescript
@Action(MyNewAction)
handleMyNewAction(ctx: StateContext<BookStateModel>, action: MyNewAction) {
  // Handle action
}
```

3. **Create Selector** in `book.selectors.ts`
```typescript
@Selector()
static myNewSelector(state: BookStateModel): any {
  return state.books; // or derived data
}
```

4. **Use in Component**
```typescript
myData$ = this.store.select(BookState.myNewSelector);
```

### Integrating with Existing .NET API

Ensure your .NET API matches the expected contract in `BookService`:
- Proper HTTP status codes
- CORS configuration for Angular localhost
- Proper error responses with meaningful messages
- DateTime serialization consistency

---

## Troubleshooting

### API Connection Issues
- Check that .NET API is running on `https://localhost:5001`
- Verify CORS is configured in .NET API
- Check browser console for network errors

### State Not Updating
- Ensure actions are properly dispatched
- Check DevTools to see if action is received
- Verify reducer logic in @Action handler

### Form Validation Not Working
- Ensure FormGroup is properly initialized
- Check validator configuration
- Verify form control names match

---

## Next Steps

1. Connect to your .NET Core 10 API
2. Test all CRUD operations
3. Add authentication/authorization
4. Implement error boundary component
5. Add loading skeleton screens
6. Implement pagination for large datasets
7. Add unit tests
8. Deploy to production

---

## Resources

- [Angular Documentation](https://angular.dev)
- [NGXS Documentation](https://www.ngxs.io)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Created:** December 7, 2025
**Angular Version:** 21.0.0
**NGXS Version:** Latest
**TypeScript Version:** 5.9+
