import { Routes } from '@angular/router';

/* Deliberately unguarded: App Store Connect needs a privacy policy URL that opens without
   an account, and this is the same page the app itself shows. */
export const legalRoutes: Routes = [
  {
    path: ':doc',
    loadComponent: () =>
      import('@pages/legal-doc/legal-doc-page').then(({ LegalDocPage }) => LegalDocPage),
  },
];
