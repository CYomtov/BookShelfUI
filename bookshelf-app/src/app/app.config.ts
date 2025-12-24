import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore } from '@ngxs/store';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { BookState } from './store/book.state';

/**
 * Application Configuration
 * Best Practice: Centralized configuration with proper module setup
 * Includes NGXS store and HTTP client with fetch API support
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideNoopAnimations(),
    
    /**
     * NGXS Store Configuration
     * Best Practice: Configure store for state management
     */
    provideStore(
      [BookState], // List all states here
      {
        developmentMode: isDevMode(),
      }
    ),
  ]
};