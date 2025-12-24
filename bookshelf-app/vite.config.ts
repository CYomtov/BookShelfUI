import { defineConfig } from 'vite';

// Treat the optional Angular animations runtime import as external so Vite
// doesn't try to resolve it during SSR/build. This keeps us from having to
// install the deprecated `@angular/animations` package while using
// `provideNoopAnimations()` in the app.
export default defineConfig({
  ssr: {
    external: ['@angular/animations/browser'],
  },
  optimizeDeps: {
    exclude: ['@angular/animations/browser'],
  },
});
