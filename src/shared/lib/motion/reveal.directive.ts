import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';

const DEFAULT_STAGGER = 0.045;

/** Reveals late children once; reduced motion skips tween creation because GSAP hides from-targets eagerly. */
@Directive({
  selector: '[appReveal]',
})
export class Reveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** A bare attribute arrives as an empty string and maps to the default stagger. */
  readonly stagger = input(DEFAULT_STAGGER, {
    alias: 'appReveal',
    transform: (value: number | string) =>
      value === '' || value === null ? DEFAULT_STAGGER : Number(value),
  });

  constructor() {
    afterNextRender(() => {
      const host = this.host.nativeElement;
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const revealed = new WeakSet<Element>();

        const reveal = (candidates: readonly Element[]): void => {
          const fresh = candidates.filter(
            (element) => !revealed.has(element) && !element.hasAttribute('data-no-reveal'),
          );
          if (!fresh.length) return;

          fresh.forEach((element) => revealed.add(element));
          gsap.from(fresh, {
            autoAlpha: 0,
            y: 8,
            duration: 0.42,
            ease: 'power2.out',
            stagger: this.stagger(),
          });
        };

        reveal(Array.from(host.children));

        const observer = new MutationObserver((records) => {
          const added = records
            .flatMap((record) => Array.from(record.addedNodes))
            .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE);

          reveal(added);
        });

        observer.observe(host, { childList: true });

        return () => observer.disconnect();
      });

      this.destroyRef.onDestroy(() => media.revert());
    });
  }
}
