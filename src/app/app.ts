import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/ion-app';

import { AppShell } from '@widgets/app-shell';

@Component({
  selector: 'app-root',
  imports: [AppShell, IonApp],
  template: `<ion-app><app-shell /></ion-app>`,
})
export class App {}
