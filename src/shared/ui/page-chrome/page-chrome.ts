import { Directive, ElementRef, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';

/** A phone's sticky section switch: a new section opens at its top. */
@Directive({ selector: 'ion-toolbar[appPhoneSwitch]', host: { '(ionChange)': 'settle()' } })
export class PhoneSwitch {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected settle(): void {
    const toolbar = this.host.nativeElement;
    const above = toolbar.previousElementSibling;
    const scroll = toolbar.closest('ion-content')?.shadowRoot?.querySelector('[part="scroll"]');
    if (!above || !scroll) return;
    /* Once stuck, its gap from the title above is the distance to scroll back. */
    const gap = toolbar.getBoundingClientRect().top - above.getBoundingClientRect().bottom;
    if (gap > 1) scroll.scrollTop -= gap;
  }
}

/** Makes each page title the h1; Ionic hides the inactive condense twin. */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- every page title
  selector: 'ion-title',
  host: { role: 'heading', 'aria-level': '1' },
})
export class PageTitle {}

export const PAGE_CHROME = [
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  PageTitle,
  PhoneSwitch,
] as const;
