/**
 * Type declarations for moment locale imports
 * This allows TypeScript to recognize moment locale module imports
 */

declare module 'moment/locale/fr' {
  const locale: string;
  export = locale;
}

declare module 'moment/locale/ar' {
  const locale: string;
  export = locale;
}
