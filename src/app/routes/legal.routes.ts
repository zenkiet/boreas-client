import { Routes } from '@angular/router';

/* Unguarded: App Store Connect needs a privacy policy URL that opens without an account. */
export const legalRoutes: Routes = [
  {
    path: ':doc',
    loadComponent: () =>
      import('@pages/legal-doc/legal-doc-page').then(({ LegalDocPage }) => LegalDocPage),
  },
];
