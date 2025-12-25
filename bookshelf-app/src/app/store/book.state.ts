import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { BookService } from '../services/book.service';
import { Book, BookStateModel, BookFilter, StatusDto, GenreDto } from '../models/book.model';
import {
  FetchPaginatedBooks,
  FetchPaginatedBooksSuccess,
  FetchPaginatedBooksError,
  FetchBooks,
  FetchBooksSuccess,
  FetchBooksError,
  FetchBookById,
  FetchBookByIdSuccess,
  FetchBookByIdError,
  CreateBook,
  CreateBookSuccess,
  CreateBookError,
  UpdateBook,
  UpdateBookSuccess,
  UpdateBookError,
  DeleteBook,
  DeleteBookSuccess,
  DeleteBookError,
  FetchStatuses,
  FetchStatusesSuccess,
  FetchStatusesError,
  FetchGenres,
  FetchGenresSuccess,
  FetchGenresError,
  SetBookFilter,
  ClearBookFilter,
  ClearSelectedBook,
} from './book.actions';

/**
 * Book State
 * Best Practice: Single responsibility - manages only book-related state
 * Uses @State decorator with default state and metadata
 */
@State<BookStateModel>({
  name: 'books',
  defaults: {
    books: [],
    selectedBook: null,
    loading: false,
    error: null,
    filter: {
      searchTerm: '',
      statusId: null,
      genreId: null,
      sortBy: 'title',
      sortOrder: 'asc',
    },
    statuses: [],
    genres: [],
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    },
  },
})
@Injectable()
export class BookState implements NgxsOnInit {
  constructor(private bookService: BookService, private snackBar: MatSnackBar) {}

  /**
   * Called when the state is initialized
   */
  ngxsOnInit(ctx: StateContext<BookStateModel>) {
    // Optional: Load initial data when store is initialized
    // ctx.dispatch(new FetchBooks());
    // ctx.dispatch(new FetchStatuses());
    // ctx.dispatch(new FetchGenres());
  }

  /**
   * Selectors - Best Practice: Static selectors for accessing state
   */
  @Selector()
  static books(state: BookStateModel): Book[] {
    return state.books;
  }

  @Selector()
  static selectedBook(state: BookStateModel): Book | null {
    return state.selectedBook;
  }

  @Selector()
  static loading(state: BookStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: BookStateModel): string | null {
    return state.error;
  }

  @Selector()
  static filter(state: BookStateModel): BookFilter {
    return state.filter;
  }

  @Selector()
  static statuses(state: BookStateModel): StatusDto[] {
    return state.statuses;
  }

  @Selector()
  static genres(state: BookStateModel): GenreDto[] {
    return state.genres;
  }

  /**
   * Memoized Selector: Filtered and sorted books
   */
  @Selector()
  static filteredBooks(state: BookStateModel): Book[] {
    const { books, filter } = state;
    let filtered = [...books];

    // Apply search filter
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          (book.title?.toLowerCase().includes(term) || false) ||
          (book.author?.toLowerCase().includes(term) || false)
      );
    }

    // Apply genre filter
    if (filter.genreId !== null && filter.genreId !== undefined) {
      filtered = filtered.filter((book) => {
        const genreId = state.genres.find((g) => g.genreId === filter.genreId);
        return genreId && book.genre === genreId.genreName;
      });
    }

    // Apply status filter
    if (filter.statusId !== null && filter.statusId !== undefined) {
      const selectedStatus = state.statuses.find((s) => s.statusId === filter.statusId);
      if (selectedStatus) {
        filtered = filtered.filter((book) => book.status === selectedStatus.statusName);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (filter.sortBy) {
        case 'title':
          aVal = a.title || '';
          bVal = b.title || '';
          break;
        case 'author':
          aVal = a.author || '';
          bVal = b.author || '';
          break;
        case 'genre':
          aVal = a.genre || '';
          bVal = b.genre || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'publishedYear':
          aVal = a.publishedYear || 0;
          bVal = b.publishedYear || 0;
          break;
        default:
          aVal = a.title || '';
          bVal = b.title || '';
      }

      if (filter.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }

  /**
   * Get available genres from lookups
   */
  @Selector()
  static availableGenres(state: BookStateModel): GenreDto[] {
    return state.genres;
  }

  /**
   * Get available statuses from lookups
   */
  @Selector()
  static availableStatuses(state: BookStateModel): StatusDto[] {
    return state.statuses;
  }

  /**
   * Get pagination info
   */
  @Selector()
  static pagination(state: BookStateModel) {
    return state.pagination;
  }

  /**
   * FETCH PAGINATED BOOKS (Server-side filtering and pagination)
   */
  @Action(FetchPaginatedBooks)
  fetchPaginatedBooks(ctx: StateContext<BookStateModel>, action: FetchPaginatedBooks) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.getBooks(action.payload).subscribe({
      next: (response) => {
        ctx.dispatch(new FetchPaginatedBooksSuccess(response));
      },
      error: (error) => {
        ctx.dispatch(new FetchPaginatedBooksError(error.message));
      },
    });
  }

  @Action(FetchPaginatedBooksSuccess)
  fetchPaginatedBooksSuccess(ctx: StateContext<BookStateModel>, action: FetchPaginatedBooksSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      books: action.payload.items,
      pagination: {
        currentPage: action.payload.page,
        pageSize: action.payload.pageSize,
        totalCount: action.payload.totalCount,
        totalPages: action.payload.totalPages,
      },
      loading: false,
      error: null,
    });
  }

  @Action(FetchPaginatedBooksError)
  fetchPaginatedBooksError(ctx: StateContext<BookStateModel>, action: FetchPaginatedBooksError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to load books: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * FETCH ALL BOOKS
   */
  @Action(FetchBooks)
  fetchBooks(ctx: StateContext<BookStateModel>) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.getAllBooks().subscribe({
      next: (books) => {
        ctx.dispatch(new FetchBooksSuccess(books));
      },
      error: (error) => {
        ctx.dispatch(new FetchBooksError(error.message));
      },
    });
  }

  @Action(FetchBooksSuccess)
  fetchBooksSuccess(ctx: StateContext<BookStateModel>, action: FetchBooksSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      books: action.payload,
      loading: false,
      error: null,
    });
  }

  @Action(FetchBooksError)
  fetchBooksError(ctx: StateContext<BookStateModel>, action: FetchBooksError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to load all books: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * FETCH SINGLE BOOK BY ID
   */
  @Action(FetchBookById)
  fetchBookById(ctx: StateContext<BookStateModel>, action: FetchBookById) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.getBookById(action.payload).subscribe({
      next: (book) => {
        ctx.dispatch(new FetchBookByIdSuccess(book));
      },
      error: (error) => {
        ctx.dispatch(new FetchBookByIdError(error.message));
      },
    });
  }

  @Action(FetchBookByIdSuccess)
  fetchBookByIdSuccess(ctx: StateContext<BookStateModel>, action: FetchBookByIdSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      selectedBook: action.payload,
      loading: false,
      error: null,
    });
  }

  @Action(FetchBookByIdError)
  fetchBookByIdError(ctx: StateContext<BookStateModel>, action: FetchBookByIdError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to load book: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * CREATE BOOK
   */
  @Action(CreateBook)
  createBook(ctx: StateContext<BookStateModel>, action: CreateBook) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.createBook(action.payload).subscribe({
      next: (book) => {
        ctx.dispatch(new CreateBookSuccess(book));
      },
      error: (error) => {
        ctx.dispatch(new CreateBookError(error.message));
      },
    });
  }

  @Action(CreateBookSuccess)
  createBookSuccess(ctx: StateContext<BookStateModel>, action: CreateBookSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      books: [...state.books, action.payload],
      loading: false,
      error: null,
    });
    this.snackBar.open('Book created', 'Close', { duration: 3000 });
  }

  @Action(CreateBookError)
  createBookError(ctx: StateContext<BookStateModel>, action: CreateBookError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to create book: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * UPDATE BOOK
   */
  @Action(UpdateBook)
  updateBook(ctx: StateContext<BookStateModel>, action: UpdateBook) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.updateBook(action.payload).subscribe({
      next: (book) => {
        ctx.dispatch(new UpdateBookSuccess(book));
      },
      error: (error) => {
        ctx.dispatch(new UpdateBookError(error.message));
      },
    });
  }

  @Action(UpdateBookSuccess)
  updateBookSuccess(ctx: StateContext<BookStateModel>, action: UpdateBookSuccess) {
    const state = ctx.getState();
    const books = state.books.map((book) =>
      book.id === action.payload.id ? action.payload : book
    );

    ctx.setState({
      ...state,
      books,
      selectedBook: action.payload,
      loading: false,
      error: null,
    });
    this.snackBar.open('Book updated', 'Close', { duration: 3000 });
  }

  @Action(UpdateBookError)
  updateBookError(ctx: StateContext<BookStateModel>, action: UpdateBookError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to update book: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * DELETE BOOK
   */
  @Action(DeleteBook)
  deleteBook(ctx: StateContext<BookStateModel>, action: DeleteBook) {
    ctx.patchState({ loading: true, error: null });

    return this.bookService.deleteBook(action.payload).subscribe({
      next: () => {
        ctx.dispatch(new DeleteBookSuccess(action.payload));
      },
      error: (error) => {
        ctx.dispatch(new DeleteBookError(error.message));
      },
    });
  }

  @Action(DeleteBookSuccess)
  deleteBookSuccess(ctx: StateContext<BookStateModel>, action: DeleteBookSuccess) {
    const state = ctx.getState();
    const books = state.books.filter((book) => book.id !== action.payload);

    ctx.setState({
      ...state,
      books,
      selectedBook: state.selectedBook?.id === action.payload ? null : state.selectedBook,
      loading: false,
      error: null,
    });
    this.snackBar.open('Book deleted', 'Close', { duration: 3000 });
  }

  @Action(DeleteBookError)
  deleteBookError(ctx: StateContext<BookStateModel>, action: DeleteBookError) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      loading: false,
      error: action.payload,
    });
    this.snackBar.open(`Failed to delete book: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * FETCH STATUSES
   */
  @Action(FetchStatuses)
  fetchStatuses(ctx: StateContext<BookStateModel>) {
    return this.bookService.getStatuses().subscribe({
      next: (statuses) => {
        ctx.dispatch(new FetchStatusesSuccess(statuses));
      },
      error: (error) => {
        ctx.dispatch(new FetchStatusesError(error.message));
      },
    });
  }

  @Action(FetchStatusesSuccess)
  fetchStatusesSuccess(ctx: StateContext<BookStateModel>, action: FetchStatusesSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      statuses: action.payload,
    });
  }

  @Action(FetchStatusesError)
  fetchStatusesError(ctx: StateContext<BookStateModel>, action: FetchStatusesError) {
    // Error already logged via service layer
  }

  /**
   * FETCH GENRES
   */
  @Action(FetchGenres)
  fetchGenres(ctx: StateContext<BookStateModel>) {
    return this.bookService.getGenres().subscribe({
      next: (genres) => {
        ctx.dispatch(new FetchGenresSuccess(genres));
      },
      error: (error) => {
        ctx.dispatch(new FetchGenresError(error.message));
      },
    });
  }

  @Action(FetchGenresSuccess)
  fetchGenresSuccess(ctx: StateContext<BookStateModel>, action: FetchGenresSuccess) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      genres: action.payload,
    });
  }

  @Action(FetchGenresError)
  fetchGenresError(ctx: StateContext<BookStateModel>, action: FetchGenresError) {
    this.snackBar.open(`Failed to load genres: ${action.payload}`, 'Close', { duration: 4000 });
  }

  /**
   * SET FILTER
   */
  @Action(SetBookFilter)
  setFilter(ctx: StateContext<BookStateModel>, action: SetBookFilter) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      filter: { ...state.filter, ...action.payload },
    });
  }

  /**
   * CLEAR FILTER
   */
  @Action(ClearBookFilter)
  clearFilter(ctx: StateContext<BookStateModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      filter: {
        searchTerm: '',
        statusId: null,
        genreId: null,
        sortBy: 'title',
        sortOrder: 'asc',
      },
    });
  }

  /**
   * CLEAR SELECTED BOOK
   */
  @Action(ClearSelectedBook)
  clearSelectedBook(ctx: StateContext<BookStateModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      selectedBook: null,
    });
  }
}
