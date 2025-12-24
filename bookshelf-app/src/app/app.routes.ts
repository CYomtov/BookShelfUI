import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookDetailComponent } from './components/book-detail/book-detail.component';

/**
 * Application Routes
 * Best Practice: Organize routes logically with clear naming
 * Order: specific routes before dynamic routes
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full',
  },
  {
    path: 'books',
    component: BookListComponent,
  },
  {
    path: 'books/add',
    component: BookFormComponent,
  },
  {
    path: 'books/:id',
    component: BookDetailComponent,
    data: { prerender: false }, // Disable prerendering for dynamic routes
  },
  {
    path: 'books/:id/edit',
    component: BookFormComponent,
    data: { prerender: false }, // Disable prerendering for dynamic routes
  },
  {
    path: '**',
    redirectTo: 'books',
  },
];
