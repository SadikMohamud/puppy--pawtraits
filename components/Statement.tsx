'use client';

import { useRef } from 'react';
import { findWork } from '@/lib/catalogue';
import { Photo } from './Photo';
import { gsap, prefersReducedMotion, useGSAP } from './motion/gsap';

// Ported from the Awwwards Pack "Expanding Image Animation within Typography" (Scroll Animation 17, the full-width effect).
// As the reader scrolls through the line, the portraits widen out of nothing, the big one to the full measure.
// The space for the big portrait is reserved up front so nothing below jumps while it grows.

const nell = findWork('nell')!;
const bear = findWork('bear')!;
const pip = findWork('pip')!;

export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const type = root.current?.querySelector<HTMLElement>('.type');
      if (!type) return;
      if (prefersReducedMotion()) {
        type.classList.add('type--open');
        return;
      }
      gsap
        .timeline({ scrollTrigger: { trigger: type, start: 'clamp(top bottom)', end: '+=135%', scrub: true } })
        .fromTo('.type__mini', { width: 0 }, { width: '1.3em', ease: 'power1.inOut', duration: 0.5 }, 0)
        .fromTo('.type__img', { width: '0%' }, { width: '100%', ease: 'power1.inOut', duration: 1 }, 0)
        .fromTo('.type__img .photo', { scale: 1.4 }, { scale: 1, ease: 'power1.out', duration: 1 }, 0);

      gsap.to('.statement__block', {
        ease: 'sine.inOut',
        yPercent: -50,
        skewX: -4,
        rotation: 2,
        opacity: 0.2,
        scrollTrigger: { trigger: '.statement__block', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="statement" aria-labelledby="statement-title">
      <h2 id="statement-title" className="type">
        Every dog
        <br />
        sits{' '}
        <span className="type__mini" aria-hidden="true"><Photo work={bear} sizes="120px" decorative /></span>{' '}
        <span className="type__mini" aria-hidden="true"><Photo work={pip} sizes="120px" decorative /></span>{' '}
        a little
        <span className="type__full">
          <span className="type__img" aria-hidden="true"><Photo work={nell} sizes="100vw" decorative /></span>
        </span>
        <em>differently.</em>
      </h2>
      <p className="statement__block">
        Some sit like statues. Some never sit at all. Jason works at the dog’s pace, with patience, treats and a
        quiet studio or a favourite walk, until the dog in the picture is the one you know at home.
      </p>
    </section>
  );
}
