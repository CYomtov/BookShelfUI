import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'books/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Return empty array to skip prerendering for this route
      return [];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
