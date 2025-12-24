# Bookshelf Application - Angular with NGXS

A modern, feature-rich Angular application demonstrating best practices for state management using NGXS, reactive forms, and integration with a .NET Core 10 API.

## 📋 Project Overview

This Bookshelf Application showcases:
- **NGXS Store Pattern**: Centralized state management with actions, selectors, and effects
- **Standalone Components**: Modern Angular 21+ standalone component architecture
- **Reactive Forms**: Comprehensive form validation and handling
- **REST API Integration**: HTTP client integration with .NET Core 10 backend
- **Responsive Design**: Mobile-first SCSS styling
- **Type Safety**: Full TypeScript typing throughout
- **Best Practices**: Clean code, proper error handling, and optimization

## 🚀 Features

### Book Management
- ✅ View all books with filtering and sorting
- ✅ Add new books with form validation
- ✅ Edit existing books
- ✅ Delete books with confirmation
- ✅ Search books by title or author
- ✅ Filter by category
- ✅ Sort by title, author, rating, or published date

### State Management (NGXS)
- ✅ Centralized book store
- ✅ Action-based state updates
- ✅ Memoized selectors for performance
- ✅ Error handling and loading states
- ✅ Logger plugin for debugging
- ✅ Redux DevTools integration

## 📁 Project Structure

```
bookshelf-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── book-form/
│   │   │   │   ├── book-form.component.ts
│   │   │   │   ├── book-form.component.html
│   │   │   │   └── book-form.component.scss
│   │   │   └── book-list/
│   │   │       ├── book-list.component.ts
│   │   │       ├── book-list.component.html
│   │   │       └── book-list.component.scss
│   │   ├── models/
│   │   │   └── book.model.ts          # Book interfaces and DTOs
│   │   ├── services/
│   │   │   └── book.service.ts        # HTTP service for API calls
│   │   ├── store/
│   │   │   ├── book.actions.ts        # NGXS actions
│   │   │   ├── book.state.ts          # NGXS state and handlers
│   │   │   └── book.selectors.ts      # State selectors
│   │   ├── app.ts                     # Root component
│   │   ├── app.html                   # Root template
│   │   ├── app.scss                   # Root styles
│   │   ├── app.config.ts              # App configuration with NGXS setup
│   │   └── app.routes.ts              # Route configuration
│   ├── environments/
│   │   ├── environment.ts             # Development config
│   │   └── environment.prod.ts        # Production config
│   ├── main.ts                        # Application bootstrap
│   └── styles.scss                    # Global styles
├── angular.json                       # Angular CLI config
├── package.json                       # Dependencies
└── README.md                          # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Angular CLI (v21+)
- npm or yarn

### Setup Steps

1. **Clone/Navigate to project**
   ```bash
   cd c:\Code\BookShelfUI\bookshelf-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   Update `src/environments/environment.ts` with your .NET Core 10 API endpoint:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://your-api-url/api',
     apiBaseUrl: 'https://your-api-url',
     enableDebugTools: true,
     logLevel: 'debug',
   };
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

## 🎯 NGXS Architecture

### Store Structure

```
books (Store)
├── books: Book[]              # Array of all books
├── selectedBook: Book | null  # Currently selected book
├── loading: boolean           # Loading state
├── error: string | null       # Error messages
└── filter: BookFilter         # Current filter state
```

### Actions Flow

```
User Interaction
    ↓
Dispatch Action (e.g., FetchBooks)
    ↓
Book Service (HTTP call)
    ↓
Success/Error Action
    ↓
State Updated
    ↓
Selectors notify Components
    ↓
Component UI Updated
```

### Available Selectors

```typescript
// Select all books
store.select(BookState.books)

// Select filtered books (with search, category, sorting)
store.select(BookState.filteredBooks)

// Select loading state
store.select(BookState.loading)

// Select error messages
store.select(BookState.error)

// Select available categories
store.select(BookState.availableCategories)

// Select filter configuration
store.select(BookState.filter)
```

## 📝 API Integration

### Expected API Endpoints

Your .NET Core 10 API should provide these endpoints:

```
GET    /api/books              # Get all books
GET    /api/books/{id}         # Get single book
POST   /api/books              # Create new book
PUT    /api/books/{id}         # Update book
DELETE /api/books/{id}         # Delete book
GET    /api/books/search?q=... # Search books
GET    /api/books/category/... # Get books by category
```

### Request/Response Models

**Book Model (Response)**
```typescript
{
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

**Create Book Request**
```typescript
{
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedDate: Date;
  pageCount: number;
  category: string;
  imageUrl: string;
}
```

## 🧪 Testing & Debugging

### Redux DevTools Integration

1. Install [Redux DevTools Browser Extension](https://github.com/reduxjs/redux-devtools-extension)
2. Run the app in development mode
3. Open Redux DevTools from browser extensions
4. View all actions, state changes, and time-travel debug

### Console Logging

NGXS Logger Plugin logs all actions and state changes to console:
```
[NGXS] Dispatching action FetchBooks
[NGXS] Dispatching action FetchBooksSuccess
State Updated: { books: [...], loading: false }
```

## 🚦 Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Watch for changes during development
npm run watch
```

## 📊 Performance Optimizations

- **Memoized Selectors**: State derived selectors are cached
- **OnPush Change Detection**: Ready to be added to components
- **TrackBy Functions**: Optimized *ngFor loops
- **Lazy Loading**: Route-based code splitting ready
- **Type Safety**: Full TypeScript prevents runtime errors

## 🔐 Best Practices Implemented

✅ **Single Responsibility**: Each service, component, and state handler has one purpose
✅ **Type Safety**: Full TypeScript typing with interfaces and models
✅ **Error Handling**: Centralized error handling in services
✅ **State Immutability**: Proper state updates without mutations
✅ **Memory Management**: Proper subscription cleanup with takeUntil
✅ **Code Organization**: Clear folder structure and file naming
✅ **Documentation**: Comprehensive JSDoc comments
✅ **Reactive**: Observables and async pipes throughout
✅ **Responsive**: Mobile-first CSS design
✅ **Accessibility**: Semantic HTML and ARIA labels (ready to enhance)

## 🔌 Integration Checklist

Before connecting to your .NET Core 10 API:

- [ ] Update API URLs in `environment.ts`
- [ ] Ensure CORS is configured on API
- [ ] Verify API endpoint structure matches expected routes
- [ ] Test book model mapping matches API responses
- [ ] Configure any authentication/authorization if needed
- [ ] Test API responses in browser DevTools
- [ ] Verify date format consistency (ISO 8601 recommended)

## 🐛 Troubleshooting

**API Connection Issues**
- Check environment.ts API URL configuration
- Verify .NET Core API is running
- Check browser console for CORS errors
- Ensure API is accessible from localhost:4200

**State Not Updating**
- Open Redux DevTools to see action dispatch
- Check NGXS logger in console
- Verify selectors are correctly typed
- Ensure components are subscribed to correct selectors

**Form Validation Issues**
- Check form control names match formControlName
- Verify validators are applied correctly
- Check async validators if using any
- Review error messages in form-error divs

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [NGXS Documentation](https://www.ngxs.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools-extension)

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please follow the established code style and add tests for new features.

---

**Built with Angular 21 and NGXS** | **Designed for .NET Core 10 API Integration**
