/**
 * Environment Configuration - Development
 * Best Practice: Centralize API URLs and environment-specific settings
 * API runs locally on port 7181 during development
 * Verified working URL: https://localhost:7181/api/Books
 */
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7181/api',
  enableDebugTools: true,
  logLevel: 'debug',
};
