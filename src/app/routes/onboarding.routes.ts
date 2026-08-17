import { Routes } from '@angular/router';

import { WelcomePage } from '@pages/welcome/welcome-page';

export const onboardingRoutes: Routes = [
  { path: '', component: WelcomePage, title: 'Welcome | Boreas' },
  { path: '**', redirectTo: '' },
];
